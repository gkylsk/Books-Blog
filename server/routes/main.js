const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

/**
 * GET/
 * Home
 */
router.get('/',async (req,res)=>{
    try{
        const locals = {
            title: "Book Blog",
            description: "Blog to read different books"
        } // pass or render ejs data
        
        let perPage = 10;
        let page = req.query.page || 1;

        const data = await Post.aggregate([{$sort: {createdAt:-1}}])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();

        const count = await Post.find().countDocuments();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        res.render('index',{
            locals,
            data,
            currect: page,
            nextPage: hasNextPage? nextPage : null,
            currentRoute: '/'
        });
    } catch(error){
        console.log(error);
    }
});

/**
 * GET/
 * Post : id
 */
router.get('/post/:id', async(req,res)=>{
    try{
        let slug = req.params.id;

        const data = await Post.findById({_id:slug});

        const locals = {
            title: data.title,
            description: "Blog to read different books",
        }
        res.render('post',{
            locals,
            data,
            currentRoute: `/post/${slug}`
        });
    }catch(error){
        console.log(error);
    }
});

/**
 * POST/
 * Post - searchTerm
 */
router.post('/search', async(req,res)=>{
    try{
        const locals = {
            title: "Search",
            description: "Blog to read different books"
        }

        let searchTerm = req.body.searchTerm;
        const searchNoSpeacialChar = searchTerm.replace(/[^a-zA-Z0-9]/g,"");

        const data = await Post.find({
            $or:[
                {title:{$regex:new RegExp(searchNoSpeacialChar, 'i')}}, // i for case-insensitive RE
                {body:{$regex:new RegExp(searchNoSpeacialChar, 'i')}},
                {author:{$regex:new RegExp(searchNoSpeacialChar, 'i')}}
            ]
        });
        res.render('search',{
            locals,
            data,
            currentRoute: '/'
        });
    }catch(error){
        console.log(error);
    }
});

/**
 * GET/
 * About
 */
router.get('/about',(req,res) => {
    res.render('about',{
        currentRoute: '/about'
    });
})

module.exports = router;





// function insertPostData(){
//     Post.insertMany([
//         {
//             title: "The Spanish Love Deception",
//             body: "Catalina Martín desperately needs a date to her sister’s wedding. Especially since her little white lie about her American boyfriend has spiralled out of control. Now everyone she knows—including her ex and his fiancée—will be there and eager to meet him. She only has four weeks to find someone willing to cross the Atlantic and aid in her deception. New York to Spain is no short flight and her raucous family won’t be easy to fool. Enter Aaron Blackford—her tall, handsome, condescending colleague—who surprisingly offers to step in. She’d rather refuse; never has there been a more aggravating, blood-boiling, and insufferable man. But Catalina is desperate, and as the wedding draws nearer, Aaron looks like her best option. And she begins to realize he might not be as terrible in the real world as he is at the office.", 
//             author:"Elena Armas",
//             image: "the-spanish-love-deception.jpg"   
//         },
//         {
//             title: "Don't Turn Around",
//             body: "Sixteen-year-old Noa has been a victim of the system ever since her parents died. Now living off the grid and trusting no one, she uses her computer-hacking skills to stay safely anonymous and alone. But when she wakes up on a table in an empty warehouse with an IV in her arm and no memory of how she got there, Noa starts to wish she had someone on her side. Enter Peter Gregory. A rich kid and the leader of a hacker alliance, Peter needs people with Noa's talents on his team. Especially after a shady corporation called AMRF threatens his life in no uncertain terms. But what Noa and Peter don't realize is that Noa holds the key to a terrible secret, and there are those who'd stop at nothing to silence her for good.", 
//             author:"Michelle Gagnon",
//             image: "dont-turn-around.jpg"  
//         },
//         {
//             title: "Harry Potter and the Deathly Hallows",
//             body:"Harry Potter and the Deathly Hallows finishes off an exciting series that is one of the best of all time. In this book Harry finds out that he must kill Lord Voldemort and can only do so by finding his hidden Horcruxes. The book contains an astonishing ending and many characters fight for their lives. It also has twists, turns and plenty of action as Harry, Ron and Hermione run from Death Eaters on the quest to kill Voldemort. I would recommend this book for older readers and adults. Also, I would recommend reading the books before this one to understand what is going on in the story. It is an overall action-packed adventure.", 
//             author:"J. K. Rowling",
//             image: "harry-pooter-7.jpg"  
//         },
//         {
//             title: "Dune",
//             body:"It's so hard to sum up this truly magnificent bit of storytelling and universe creation. In my mind its in the same top-tier with the classics of science fiction and fantasy, standing shoulder to shoulder with likes of Tolkien's masterpiece Lord of the Rings and Azimov’s Foundation Trilogy. People often view it as a pure science fiction novel - which it is - but it is so much more. It is a commentary on religion, myth, fanaticism, love, hate, wisdom passed through generations, loyalty, courage, betrayal, and the complicated interconnectedness and balance of planetary ecosystems. And that is just scratching the surface! If you're not ready for a book with that level of complexity -- one requiring you to engage your brain at all times -- I recommend you take a pass. If you’re ready for a mind-bending, sweeping narrative with interesting characters, good writing and a satisfying plot, this may be the perfect book for you. I first read it 48 years ago, not long after it was published, and I was hooked. I re-read it two years ago and it felt as relevant today as it did in 1975.  In 1980 I recommended it to my English Literature girlfriend (later wife) who said (with her nose in the air) ‘I don’t really like science fiction that much.’ But I persisted, and she decided to read it.  16 books-in-the-series-later she admitted that it was one of her favorite books of all time (and she has read literally thousands).  If I could give it 6 stars I would.", 
//             author:"Frank Herbert",
//             image: "dune.jpg"  
//         },
//     ])
// }
// insertPostData();