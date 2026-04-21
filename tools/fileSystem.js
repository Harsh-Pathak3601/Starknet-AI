/**
 * fileSystem.js
 * Tool: File system utilities — read, write, append, delete, list.
 * Agents can use these to persist outputs to disk.
 */

import fs   from "fs/promises";
import path from "path";

/**
 * readFile — reads a file and returns its content as a string.
 *
 * @param {string} filePath - Absolute or relative path to the file.
 * @param {string} encoding - File encoding (default: "utf-8").
 * @returns {Promise<string>}
 */
export async function readFile(filePath, encoding = "utf-8") {
  const resolved = path.resolve(filePath);
  return await fs.readFile(resolved, encoding);
}

/**
 * writeFile — writes content to a file, creating it if it doesn't exist.
 * Overwrites existing content by default.
 *
 * @param {string} filePath - Path to write to.
 * @param {string} content  - Content to write.
 * @returns {Promise<void>}
 */
export async function writeFile(filePath, content) {
  const resolved = path.resolve(filePath);
  // Ensure parent directories exist
  await fs.mkdir(path.dirname(resolved), { recursive: true });
  await fs.writeFile(resolved, content, "utf-8");
}

/**
 * appendFile — appends content to an existing file (or creates it).
 *
 * @param {string} filePath - Path to the file.
 * @param {string} content  - Content to append.
 * @returns {Promise<void>}
 */
export async function appendFile(filePath, content) {
  const resolved = path.resolve(filePath);
  await fs.mkdir(path.dirname(resolved), { recursive: true });
  await fs.appendFile(resolved, content, "utf-8");
}

/**
 * deleteFile — removes a file from disk.
 *
 * @param {string} filePath - Path to the file.
 * @returns {Promise<void>}
 */
export async function deleteFile(filePath) {
  const resolved = path.resolve(filePath);
  await fs.rm(resolved, { force: true });
}

/**
 * listDir — lists all entries in a directory.
 *
 * @param {string} dirPath - Path to the directory.
 * @returns {Promise<string[]>} - Array of file/folder names.
 */
export async function listDir(dirPath) {
  const resolved = path.resolve(dirPath);
  return await fs.readdir(resolved);
}

/**
 * fileExists — checks whether a file or directory exists.
 *
 * @param {string} targetPath
 * @returns {Promise<boolean>}
 */
export async function fileExists(targetPath) {
  try {
    await fs.access(path.resolve(targetPath));
    return true;
  } catch {
    return false;
  }
}
