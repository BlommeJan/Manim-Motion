/**
 * Manim Studio Compiler
 * 
 * Compiles project JSON to Manim Python code.
 * Pipeline: Validate -> Normalize -> Codegen
 */

import { validateProject } from './validator.js';
import { normalizeProject } from './normalizer.js';
import { generatePythonCode } from './codegen.js';

/**
 * Compile a project JSON to Manim Python code.
 * @param {Object} project - The project JSON
 * @param {string} assetsBasePath - Base path for assets (e.g., /data/assets/proj_1)
 * @returns {{ success: boolean, code?: string, errors?: string[] }}
 */
export function compileProject(project, assetsBasePath) {
  // Step 1: Validate
  const validation = validateProject(project);
  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors
    };
  }

  // Step 2: Normalize
  const normalized = normalizeProject(project);

  // Step 3: Generate Python code
  const code = generatePythonCode(normalized, assetsBasePath);

  return {
    success: true,
    code
  };
}

export { validateProject, normalizeProject, generatePythonCode };
