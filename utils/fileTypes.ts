export const mimeTypes: { [key: string]: string } = {
  // Images
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/x-icon': 'ico',
  'image/bmp': 'bmp',
  'image/tiff': 'tiff',
  'image/heic': 'heic',

  // Audio
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
  'audio/x-aac': 'aac',
  'audio/flac': 'flac',
  'audio/webm': 'weba',

  // Video
  'video/mp4': 'mp4',
  'video/x-msvideo': 'avi',
  'video/x-ms-wmv': 'wmv',
  'video/mpeg': 'mpeg',
  'video/ogg': 'ogv',
  'video/webm': 'webm',
  'video/3gpp': '3gp',
  'video/quicktime': 'mov',

  // Documents
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    'pptx',
  'application/rtf': 'rtf',
  'application/vnd.oasis.opendocument.text': 'odt',
  'application/vnd.oasis.opendocument.spreadsheet': 'ods',
  'application/vnd.oasis.opendocument.presentation': 'odp',

  // Text
  'text/plain': 'txt',
  'text/html': 'html',
  'text/css': 'css',
  'text/csv': 'csv',
  'application/json': 'json',
  'application/xml': 'xml',

  // Archives
  'application/zip': 'zip',
  'application/x-7z-compressed': '7z',
  'application/x-rar-compressed': 'rar',
  'application/x-tar': 'tar',
  'application/x-bzip2': 'bz2',
  'application/x-gzip': 'gz',
  'application/x-xz': 'xz',

  // Application
  'application/octet-stream': 'bin',
  'application/x-sh': 'sh',
  'application/x-msdownload': 'exe',
  'application/x-httpd-php': 'php',
  'application/x-java-archive': 'jar',
  'application/x-msaccess': 'mdb',
  'application/vnd.android.package-archive': 'apk',
  'application/x-iso9660-image': 'iso',
  'application/vnd.apple.installer+xml': 'mpkg',

  // Fonts
  'font/woff': 'woff',
  'font/woff2': 'woff2',
  'application/x-font-ttf': 'ttf',
  'application/x-font-opentype': 'otf',
  'application/vnd.ms-fontobject': 'eot',

  // Others
  'application/x-apple-diskimage': 'dmg',
  'application/x-debian-package': 'deb',
  'application/x-rpm': 'rpm',
  'application/x-dvi': 'dvi',
  'application/x-latex': 'latex',
  'application/x-tex': 'tex',

  // Add more MIME types as needed
};

/**
 * Utility function to get file extension from MIME type.
 * @param contentType - The MIME type of the file.
 * @returns The file extension.
 */
export function getFileExtension(contentType: string): string {
  return mimeTypes[contentType] || 'bin'; // Default to 'bin' if unknown
}
