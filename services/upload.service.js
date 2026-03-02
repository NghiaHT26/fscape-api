const cloudinary = require('../config/cloudinary');

/**
 * Upload 1 file buffer lên Cloudinary
 * @param {Object} file - multer file object (có buffer, mimetype)
 * @param {string} folder - thư mục trên Cloudinary (vd: 'requests', 'rooms', 'buildings')
 * @returns {string} secure_url
 */
const uploadFile = async (file, folder = 'uploads') => {
  const result = await cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
    { folder }
  );
  return result.secure_url;
};

/**
 * Upload nhiều file
 * @param {Array} files - mảng multer file objects
 * @param {string} folder
 * @returns {string[]} mảng secure_urls
 */
const uploadFiles = async (files, folder = 'uploads') => {
  const urls = [];
  for (const file of files) {
    const url = await uploadFile(file, folder);
    urls.push(url);
  }
  return urls;
};

module.exports = { uploadFile, uploadFiles };
