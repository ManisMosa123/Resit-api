const { Snippet } = require('../models'); // 
const { verifyToken } = require('../middleware/authMiddleware'); // Import the token verification function

// Middleware to check for authentication
const authMiddleware = require('../middleware/authMiddleware');

const getSnippets = async (req, res) => {
  try {
    let snippets;
    if (req.user) {
      // Logged in user
      snippets = await Snippet.findAll({
        where: {
          userId: req.user.id
        }
      });
    } else {
      // Guest user
      snippets = await Snippet.findAll({
        where: {
          visibility: true
        }
      });
    }
    res.status(200).json(snippets);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving snippets', error });
  }
};
// GET /snippets/:id
const getSnippetById = async (req, res) => {
  try {
    const snippet = await Snippet.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }
    res.status(200).json(snippet);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving snippet', error });
  }
};

// PUT /snippets/:id
const updateSnippet = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, visibility, languageId, snippet } = req.body;

    const snippetToUpdate = await Snippet.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!snippetToUpdate) {
      return res.status(403).json({ message: 'You can only update your own snippets' });
    }

    snippetToUpdate.name = name || snippetToUpdate.name;
    snippetToUpdate.visibility = visibility ?? snippetToUpdate.visibility;
    snippetToUpdate.languageId = languageId || snippetToUpdate.languageId;
    snippetToUpdate.snippet = snippet || snippetToUpdate.snippet;

    await snippetToUpdate.save();
    res.status(200).json(snippetToUpdate);
  } catch (error) {
    res.status(500).json({ message: 'Error updating snippet', error });
  }
};

// DELETE /snippets/:id
const deleteSnippet = async (req, res) => {
  try {
    const { id } = req.params;

    const snippetToDelete = await Snippet.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!snippetToDelete) {
      return res.status(403).json({ message: 'You can only delete your own snippets' });
    }

    await snippetToDelete.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting snippet', error });
  }
};

// POST /snippets
const createSnippet = async (req, res) => {
  try {
    const { name, visibility, languageId, snippet } = req.body;

    const newSnippet = await Snippet.create({
      name,
      visibility,
      languageId,
      snippet,
      userId: req.user.id // Associate snippet with the logged-in user
    });

    res.status(201).json(newSnippet);
  } catch (error) {
    res.status(500).json({ message: 'Error creating snippet', error });
  }
};

// POST /snippets/find
const findSnippets = async (req, res) => {
  try {
    const searchParams = req.body;
    const whereClause = { userId: req.user.id };

    if (searchParams.name) {
      whereClause.name = searchParams.name;
    }
    if (searchParams.visibility !== undefined) {
      whereClause.visibility = searchParams.visibility;
    }
    if (searchParams.languageId) {
      whereClause.languageId = searchParams.languageId;
    }

    const snippets = await Snippet.findAll({ where: whereClause });

    res.status(200).json(snippets);
  } catch (error) {
    res.status(500).json({ message: 'Error searching snippets', error });
  }
};

module.exports = {
  getSnippets,
  getSnippetById,
  updateSnippet,
  deleteSnippet,
  createSnippet,
  findSnippets
};