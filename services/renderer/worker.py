"""
Manim Studio Renderer Worker

Listens to Redis queue for render jobs, executes Manim, and stores results.
"""

import os
import json
import subprocess
import time
import glob
import shutil
import redis
from pathlib import Path

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379")
DATA_DIR = os.environ.get("DATA_DIR", "/data")

# Connect to Redis
r = redis.Redis.from_url(REDIS_URL, decode_responses=True)

# Quality flag mapping
QUALITY_FLAGS = {
    "low": "-ql",          # 854x480 15fps
    "medium": "-qm",       # 1280x720 30fps
    "high": "-qh",         # 1920x1080 60fps
    "production": "-qp",   # 2560x1440 60fps
    "4k": "-qk"            # 3840x2160 60fps
}


def find_output_video(media_dir: str, scene_name: str) -> str | None:
    """Find the rendered video file in Manim's output structure."""
    # Manim outputs to: media_dir/videos/<scene_file>/<quality>/<SceneName>.mp4
    patterns = [
        f"{media_dir}/videos/**/{scene_name}.mp4",
        f"{media_dir}/**/{scene_name}.mp4",
    ]
    
    for pattern in patterns:
        matches = glob.glob(pattern, recursive=True)
        if matches:
            # Return the most recently modified
            return max(matches, key=os.path.getmtime)
    
    return None


def render_job(payload: dict) -> dict:
    """Execute a render job and return the result."""
    project_id = payload["projectId"]
    scene_name = payload.get("sceneName", "MainScene")
    quality = payload.get("quality", "medium")
    
    # Paths — honor explicit sceneFile from payload if provided
    relative_scene = payload.get("sceneFile")
    if relative_scene:
        scene_file = os.path.join(DATA_DIR, relative_scene)
    else:
        scene_file = os.path.join(DATA_DIR, "projects", project_id, "scene.py")
    media_dir = os.path.join(DATA_DIR, "renders", project_id)
    latest_link = os.path.join(media_dir, "latest.mp4")
    
    # Ensure output directory exists
    os.makedirs(media_dir, exist_ok=True)
    
    # Validate scene file exists
    if not os.path.exists(scene_file):
        return {
            "ok": False,
            "error": f"Scene file not found: {scene_file}",
            "stdout": "",
            "stderr": f"Scene file not found: {scene_file}"
        }
    
    # Clean up old renders to prevent stale output
    # Delete videos directory to force fresh render
    videos_dir = os.path.join(media_dir, "videos")
    if os.path.exists(videos_dir):
        try:
            shutil.rmtree(videos_dir)
            print(f"[render] Cleaned old renders from {videos_dir}")
        except Exception as e:
            print(f"[render] Warning: Could not clean old renders: {e}")
    
    # Build manim command
    quality_flag = QUALITY_FLAGS.get(quality, "-qm")
    cmd = [
        "manim",
        quality_flag,
        scene_file,
        scene_name,
        "--media_dir", media_dir,
        "--flush_cache"  # Clear stale cache but still use caching for speed
    ]
    
    print(f"[render] Running: {' '.join(cmd)}")
    
    # Execute manim
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=600,  # 10 minute timeout
            cwd=os.path.dirname(scene_file)
        )
        
        # Find the output video
        output_video = find_output_video(media_dir, scene_name)
        
        if output_video and os.path.exists(output_video):
            # Create/update symlink to latest render
            if os.path.exists(latest_link) or os.path.islink(latest_link):
                os.remove(latest_link)
            
            # Copy instead of symlink for Docker compatibility
            shutil.copy2(output_video, latest_link)
            
            print(f"[render] Output saved to: {latest_link}")
        
        return {
            "ok": result.returncode == 0,
            "stdout": result.stdout[-8000:] if result.stdout else "",
            "stderr": result.stderr[-8000:] if result.stderr else "",
            "outputPath": latest_link if output_video else None,
            "exitCode": result.returncode
        }
        
    except subprocess.TimeoutExpired:
        return {
            "ok": False,
            "error": "Render timeout (10 minutes exceeded)",
            "stdout": "",
            "stderr": "Render timeout (10 minutes exceeded)"
        }
    except Exception as e:
        return {
            "ok": False,
            "error": str(e),
            "stdout": "",
            "stderr": str(e)
        }


def main():
    """Main worker loop."""
    print(f"[renderer] Starting worker...")
    print(f"[renderer] Redis: {REDIS_URL}")
    print(f"[renderer] Data dir: {DATA_DIR}")
    
    # Ensure base directories exist
    os.makedirs(os.path.join(DATA_DIR, "projects"), exist_ok=True)
    os.makedirs(os.path.join(DATA_DIR, "assets"), exist_ok=True)
    os.makedirs(os.path.join(DATA_DIR, "renders"), exist_ok=True)
    
    print("[renderer] Waiting for jobs on render:queue...")
    
    while True:
        try:
            # Block waiting for job (5 second timeout to allow graceful shutdown)
            job = r.blpop("render:queue", timeout=5)
            
            if not job:
                continue
            
            _, raw = job
            payload = json.loads(raw)
            job_id = payload.get("jobId")
            
            if not job_id:
                print("[renderer] Job missing jobId, skipping")
                continue
            
            print(f"[renderer] Processing job: {job_id}")
            
            # Update job status to running
            r.hset(f"render:job:{job_id}", mapping={
                "status": "running",
                "startedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            })
            
            # Execute render
            result = render_job(payload)
            
            # Update job with result
            status = "completed" if result["ok"] else "failed"
            r.hset(f"render:job:{job_id}", mapping={
                "status": status,
                "completedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "stdout": str(result.get("stdout") or ""),
                "stderr": str(result.get("stderr") or ""),
                "outputPath": str(result.get("outputPath") or ""),
                "error": str(result.get("error") or "")
            })
            
            print(f"[renderer] Job {job_id} {status}")
            
        except redis.exceptions.ConnectionError as e:
            print(f"[renderer] Redis connection error: {e}")
            time.sleep(5)
        except json.JSONDecodeError as e:
            print(f"[renderer] Invalid job JSON: {e}")
        except KeyboardInterrupt:
            print("[renderer] Shutting down...")
            break
        except Exception as e:
            print(f"[renderer] Unexpected error in main loop: {e}")
            import traceback
            traceback.print_exc()
            time.sleep(1)


if __name__ == "__main__":
    main()
