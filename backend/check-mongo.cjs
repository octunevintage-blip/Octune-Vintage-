const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://octunevintage_db_user:EPyNa8OH81mB3NaK@octunevintagebackend.rlvxl9h.mongodb.net/test', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const db = mongoose.connection.db;
    const contents = await db.collection('contents').find({}).toArray();
    console.log(JSON.stringify(contents, null, 2));
    
    // Fix typos in contents.categories
    for (let c of contents) {
      let updated = false;
      if (c.categories) {
        c.categories.forEach(cat => {
          if (cat.image && cat.image.includes('dcsaga2di')) {
            cat.image = cat.image.replace('dcsaga2di', 'dcsaqa2di');
            updated = true;
          }
        });
      }
      if (updated) {
        await db.collection('contents').updateOne({_id: c._id}, {$set: {categories: c.categories}});
        console.log('Fixed contents doc');
      }
    }
    process.exit(0);
  });
