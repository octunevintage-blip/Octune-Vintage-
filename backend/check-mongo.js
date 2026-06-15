const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://octunevintage_db_user:EPyNa8OH81mB3NaK@octunevintagebackend.rlvxl9h.mongodb.net/test', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const db = mongoose.connection.db;
    const categories = await db.collection('categories').find({}).toArray();
    console.log('Categories:', JSON.stringify(categories, null, 2));
    process.exit(0);
  });
