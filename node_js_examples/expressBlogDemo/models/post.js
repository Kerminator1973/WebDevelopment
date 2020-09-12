var mongoose = require("mongoose");

// Определяем схему работы с данными коллекции "Posts"
var postSchema = new mongoose.Schema(
{
    title: String,
    image: String,
    content: String,
    created: {type: Date, default: Date.now}
});

// Возвращаем схему в качестве экспортируемого объекта
module.exports = mongoose.model("Post", postSchema);
