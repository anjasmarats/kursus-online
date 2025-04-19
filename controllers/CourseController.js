const { app } = require('../server');
const { Courses, User } = require('../models');
const bcryptjs = require('bcryptjs');

const postChapter = async (data) => {
    try {
        // if (!req.headers.authorization || !req.params.id) {
        //     console.log("error post course chapter unauthorized\n\nreq.headers= ",req.headers.authorization,"req.params= ",req.params);
        //     return res.status(400).json();
        // }
        const { description, video, chapterTitle, courseId, courseTitle,chapterNote } = data;
        if (!courseTitle || !description || !video || !chapterTitle || !courseId) {
            console.log("error post course chapter data tidak lengkap\ndata= ",data);
            return false;
        }
        // const isUserExist = await User.findOne(
        //     { where: { logind: req.headers.authorization.split(' ')[1] } }
        // );
        // if (!isUserExist) {
        //     console.log("error post course chapter unauthorized\nisuserexist= ",isUserExist);
        //     return res.status(404).json();
        // }
        // const coursedata = await Courses.findOne(
        //     { where: { id: req.params.id } }
        // );
        // if (!coursedata) {
        //     console.log("error post course chapter course not found\ncoursedata= ",coursedata);
        //     return res.status(404).json();
        // }
        // const video = data.video;
        const videoPath = `public/courses/videos/${courseTitle,'-',chapterTitle,'-',video.name}`;
        await video.mv(videoPath);
        await Chapters.create({
            title,
            description,
            video:`${courseTitle,'-',chapterTitle,'-',video.name}`,
            courseId,
            chapterNote
        });
    } catch (error) {
        console.log("error server post course chapter\n",error.message);
        return res.status(500).json({ error: error.message });
    }
}

app.post('/api/course', async (req, res) => {
    try {
        if (!req.headers.authorization) {
            console.log("error post course unauthorized\n\nreq.headers= ",req.headers.authorization);
        }
        const admin = await User.findOne(
            { where: { logind: req.headers.authorization.split(' ')[1],role:'admin' }
        });
        if (!admin) {
            console.log("error post course unauthorized\nadmin= ",admin);
            return res.status(404).json();
        }
        const { title, description, price, chapters, thumbnail, chapterNote } = req.body;
        if (!req.body || !title || !description || !price || !image || !req.files || !chapterNote || !chapters || chapters.length === 0 || !thumbnail) {
            console.log("error post course data tidak lengkap\nreq.body= ",req.body);
            return res.status(400).json();
        }
        const image = req.files.image;
        const imagePath = `public/courses/thumbnails/${'course-thumbnail-',title,'-',image.name}`;
        await image.mv(imagePath);
        const course = await Courses.create({
            title,
            description,
            price,
            image:`${'course-thumbnail-',title,'-',image.name}`,
            thumbnail
        });

        for (const element of chapters) {   
            const newChapter = await postChapter({
                description: element.description,
                video: element.video,
                chapterTitle: element.title,
                courseId: course.id,
                courseTitle: title,
                chapterNote
            });

            if (!newChapter) { 
                console.log("error post course \nnewChapter= ",newChapter);
                return res.status(500).json();
            }
        }
        
        return res.status(201).json(course);
    } catch (error) {
        console.log("error server post course\n",error.message);
        return res.status(500).json({ error: error.message });
    }
});
app.get('/api/course/:id', async (req, res) => {
    try {
        if (!req.params.id) {
            console.log("error get course unauthorized\nreq.params= ",req.params);
            return res.status(404).json();
        }

        // Find course by ID
        const course = await Courses.findOne(
            { where: { id: req.params.id } },
            {include: [
                { model: Chapters, as: 'chapters' },
            ]}
        );
        return res.status(200).json({course});
    } catch (error) {
        console.log("error server get course\n",error.message);
        return res.status(500).json({ error: error.message });
    }
});

app.put('/api/course/:id', async (req, res) => {
    try {
        if (!req.params.id || !req.headers.authorization) {
            console.log("error put course unauthorized\nreq.params= ",req.params,"\nreq.headers= ",req.headers.authorization);
            return res.status(400).json();
        }
        const { title, description, price } = req.body;
        if (!title || !description || !price) {
            console.log("error put course data tidak lengkap\nreq.body= ",req.body);
            return res.status(400).json();
        }

        const admin = await User.findOne(
            { where: { logind: req.headers.authorization.split(' ')[1],role:'admin' } }
        );
        if (!admin) {
            console.log("error put course unauthorized\nadmin= ",admin);
            return res.status(404).json();
        }
        if (req.files && req.files.image) {
            const image = req.files.image;
            const imagePath = `public/courses/thumbnails/${'course-thumbnail-',title,'-',image.name}`;
            await image.mv(imagePath);
            await Courses.update({
                title,
                description,
                price,
                image:`${'course-thumbnail-',title,'-',image.name}`
            }, { where: { id: req.params.id } });
        } else {
            await Courses.update({
                title,
                description,
                price
            }, { where: { id: req.params.id } });
        }
        return res.status(200).json();
    } catch (error) {
        console.log("error server put course\n",error.message);
        return res.status(500).json({ error: error.message });
    }
});
app.delete('/api/course/:id', async (req, res) => {
    try {
        if (!req.params.id || !req.headers.authorization) {
            console.log("error delete course data tidak lengkap\nreq.params= ",req.params,"\nreq.headers= ",req.headers.authorization);
            return res.status(400).json();
        }
        const admin = await User.findOne(
            { where: { logind: req.headers.authorization.split(' ')[1],role:'admin' } }
        );
        if (!admin) {
            console.log("error delete course unauthorized\nadmin= ",admin);
            return res.status(404).json();
        }
        const course = await Courses.findOne(
            { where: { id: req.params.id } }
        );
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        await Courses.destroy({ where: { id: req.params.id } });
        return res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.log("error server delete course\n",error.message);
        return res.status(500).json({ error: error.message });
    }
});

app.get('/api/courses', async (req, res) => {
    try {
        const password = await bcryptjs.hash("hiappspassword",10)
        const courses = await Courses.findAll();
        return res.status(200).json({courses});
    } catch (error) {
        console.log("error server get courses\n",error.message);
        return res.status(500).json({ error: error.message });
    }
});