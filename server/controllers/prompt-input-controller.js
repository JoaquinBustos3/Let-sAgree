exports.receivePromptInput = (req, res) => {
  const { input } = req.body;
  if (!input || typeof input !== 'string') {
    return res.status(400).json({ error: 'Input must be a non-empty string.' });
  }
  // PLACEHOLDER: eventually send to ai/pre-process
  res.json({ received: input });
};
