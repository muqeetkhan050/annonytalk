// backend startup
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL);

const messageSchema = new mongoose.Schema({ text: String, user: String });
const Message = mongoose.model('Message', messageSchema);

// Optional: create a default message if DB is empty
Message.estimatedDocumentCount().then(count => {
  if (count === 0) {
    Message.create({ text: "Welcome to AnnonyTalk!", user: "System" });
  }
});
