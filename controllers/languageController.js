const languageService = require('../services/languageService');

exports.getAllLanguages = async (req, res) => {
  try {
    const languages = await languageService.getAllLanguages();
    res.status(200).json({ status: 'success', data: { languages } });
  } catch (error) {
    res.status(500).json({ status: 'fail', data: { message: error.message } });
  }
};

exports.getLanguageById = async (req, res) => {
  const { id } = req.params;
  try {
    const language = await languageService.getLanguageById(id);
    if (!language) {
      return res.status(404).json({ status: 'fail', data: { message: 'Language not found' } });
    }
    res.status(200).json({ status: 'success', data: { language } });
  } catch (error) {
    res.status(500).json({ status: 'fail', data: { message: error.message } });
  }
};

exports.createLanguage = async (req, res) => {
  const { name } = req.body;
  try {
    const newLanguage = await languageService.createLanguage(name);
    res.status(201).json({ status: 'success', data: { newLanguage } });
  } catch (error) {
    res.status(500).json({ status: 'fail', data: { message: error.message } });
  }
};

exports.updateLanguage = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
  
    // Log to check the received parameters
    console.log(`Updating language with ID: ${id}`);
    console.log(`New name: ${name}`);
    
    try {
      if (!name) {
        return res.status(400).json({ status: 'fail', data: { message: 'Name is required' } });
      }
  
      const updatedLanguage = await languageService.updateLanguage(id, name);
      if (!updatedLanguage) {
        return res.status(404).json({ status: 'fail', data: { message: 'Language not found' } });
      }
      
      res.status(200).json({ status: 'success', data: { updatedLanguage } });
    } catch (error) {
      if (error.message.includes('A language with this name already exists')) {
        res.status(400).json({ status: 'fail', data: { message: error.message } });
      } else {
        res.status(500).json({ status: 'fail', data: { message: error.message } });
      }
    }
  };

  
exports.deleteLanguage = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedLanguage = await languageService.deleteLanguage(id);
    if (!deletedLanguage) {
      return res.status(404).json({ status: 'fail', data: { message: 'Language not found' } });
    }
    res.status(200).json({ status: 'success', data: { deletedLanguage } });
  } catch (error) {
    res.status(500).json({ status: 'fail', data: { message: error.message } });
  }
};
