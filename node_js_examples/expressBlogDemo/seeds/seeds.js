var mongoose = require("mongoose");
var Post = require("../models/post");
 
var data = [
    {
        title: "Sunshine", 
        image: "http://www.skymosity.com/blog/wp-content/uploads/2014/04/Sunshine.Grass_.Email_.EmailAptitude.Skymosity.jpeg",
        content: "Сегодня весенний солнечный день"
    },
    {
        title: "Скоро полевые цветы", 
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTl1pBj0_PyBTnM4fCDUPufdOtsJtXKNl__FjsDejNdo7O2a9XU",
        content: "Уже совсем скоро мы увидим цветение цветов!"
    },
    {
        title: "Планируем отпуск", 
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrSkfkocdWRbSyfccxdtJ3RqPjBVG6_aAUpKZlvj9s5LbYwfz0",
        content: "Тайланд - самое любимое направление нашего отпуска"
    },
    {
        title: "Мы любим города", 
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5E4jWUc5NI0SMmkcTylJTR-I0AuAD6Xd1IkpFEKVqZas9MOr3Gg",
        content: "В этом году мы снова собираемся в Бангкок"
    },
    {
        title: "Ух, бассейн!", 
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWCbu06iIZdCy_E6bBalbgeoylctLmecY5LVOgXJqiLXQOx9g2",
        content: "Бассейны - это круть!"
    }   
]
 
function seedDB(){

   // Удаляем все записи из коллекции
   Post.remove({}, function(err){
        if(err){
            console.log(err);
        }

        console.log("Удалены записи из коллекции 'posts'!");

        // Добавляем несколько базовых записей для отладки
        data.forEach(function(seed){
            Post.create(seed, function(err, pos){
                if(err){
                    console.log(err)
                } else {
                    console.log("добавлен post");
                }
            });
        });
    });
}
 
module.exports = seedDB;