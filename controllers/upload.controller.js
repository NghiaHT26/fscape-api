const { uploadFile, uploadFiles } = require('../services/upload.service');
const { UPLOAD_CONFIG } = require('../constants/uploadConfig');

exports.upload = async (req, res) => {
  try {
    const { purpose } = req.body;

    if (!purpose || !UPLOAD_CONFIG[purpose]) {
      return res.status(400).json({
        success: false,
        message: `Invalid purpose. Must be one of: ${Object.keys(UPLOAD_CONFIG).join(', ')}`
      });
    }

    const config = UPLOAD_CONFIG[purpose];
    const files = req.files || (req.file ? [req.file] : []);

    if (files.length === 0) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    if (files.length > config.maxFiles) {
      return res.status(400).json({
        success: false,
        message: `"${purpose}" allows max ${config.maxFiles} file(s), received ${files.length}`
      });
    }

    if (config.maxFiles === 1) {
      const url = await uploadFile(files[0], config.folder);
      return res.status(200).json({ success: true, data: { url } });
    }

    const urls = await uploadFiles(files, config.folder);
    return res.status(200).json({ success: true, data: { urls } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
