const { app } = require('../server');
const { Chapters, User, Courses } = require('../models');

// app.get('/api/course/:id/chapter', async (req, res) => {
//     try {
//         if (!req.headers.authorization || !req.params.id) {
//             console.log("error get course chapter unauthorized\n\nreq.headers= ",req.headers.authorization,"req.params= ",req.params);
//             return res.status(400).json();
//         }

//         const isUserExist = await User.findOne(
//             { where: { logind: req.headers.authorization.split(' ')[1] } }
//         );
        // const expiration = new Date().getTime()
        // if (!isUserExist || expiration>isUserExist.activation_time ) {
        //     return res.status(400).json();
        // }
        // if (!isUserExist) {
        //     console.log("error get course chapter unauthorized\nisuserexist= ",isUserExist);
        //     return res.status(404).json();
        // }
//         const courses = await Course.findAll({
//             where: { courseId: req.params.id },
//         });
//         res.status(200).json({courses});
//     } catch (error) {
//         console.log("error server get all course\n",error.message);
//         res.status(400).json({ error: error.message });
//     }
// });

app.get('/api/course/:id/chapter/:chapterId/video', async (req, res) => {
    try {
        if (!req.headers.authorization || !req.params.id) {
            console.log("error get course chapter video unauthorized\n\nreq.headers= ",req.headers.authorization,"req.params= ",req.params);
            return res.status(400).json();
        }
        const isUserExist = await User.findOne(
            { where: { logind: req.headers.authorization.split(' ')[1] } }
        );
        const expiration = new Date().getTime()
        const time = isUserExist.activation_time? JSON.parse(isUserExist.activation_time).time : 0
        if (!isUserExist || expiration>time ) {
            console.log("error get course chapter video unauthorized\nisuserexist= ",isUserExist);
            return res.status(400).json();
        }

        const data = await Chapters.findOne({
            where: { courseId: req.params.id,id: req.params.chapterId },
            attributes: ['video'],
        });
        const video = `/public/courses/videos/${data.video}`;
        return res.status(200).download(video, {
            headers: {
                'Content-Type': 'video/mp4',
                'Content-Disposition': `attachment; filename=${data.video}`,
            },
        });
    } catch (error) {
        console.log("error server get course chapter video\n",error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/course/:id/chapter/:chapterId', async (req, res) => {
    try {
        if (!req.headers.authorization || !req.params.id || !req.params.chapterId) {
            console.log("error get course chapter unauthorized\n\nreq.headers= ",req.headers.authorization,"req.params= ",req.params);
            return res.status(400).json();
        }
        const isUserExist = await User.findOne(
            { where: { logind: req.headers.authorization.split(' ')[1] } }
        );
        const expiration = new Date().getTime()
        const time = isUserExist.activation_time? JSON.parse(isUserExist.activation_time).time : 0
        if (!isUserExist || expiration>time ) {
            console.log("error get course chapter unauthorized\nisuserexist= ",isUserExist);
            return res.status(400).json();
        }

        const courses = await Chapters.findOne({
            where: { id: req.params.chapterId,courseId: req.params.id },
        });
        res.status(200).json({courses});
    } catch (error) {
        console.log("error server get course chapter\n",error.message);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/course/:id/chapter/:chapterId', async (req, res) => {
    try {
        if (!req.headers.authorization || !req.params.id || !req.params.chapterId) {
            console.log("error put course chapter unauthorized\n\nreq.headers= ",req.headers.authorization,"req.params= ",req.params);
            return res.status(400).json();
        }
        const { title, description, video } = req.body;
        if (!title || !description || !video) {
            console.log("error put course chapter data tidak lengkap\nreq.body= ",req.body);
            return res.status(400).json();
        }
        const admin = await User.findOne(
            { where: { logind: req.headers.authorization,role:'admin' } }
        );
        if (!admin) {
            console.log("error put course chapter unauthorized\nadmin= ",admin);
            return res.status(404).json();
        }
        await Chapters.update({
            title,
            description,
            video
        }, { where: { id: req.params.chapterId,courseId:req.params.id } });
        res.status(200).json();
    } catch (error) {
        console.log("error server put course chapter\n",error.message);
        res.status(500).json({ error: error.message });
    }
});
app.delete('/api/course/:id/chapter/:chapterId', async (req, res) => {
    try {
        if (!req.headers.authorization || !req.params.id || !req.params.chapterId) {
            console.log("error delete course chapter unauthorized\n\nreq.headers= ",req.headers.authorization,"req.params= ",req.params);
            return res.status(400).json();
        }
        const admin = await User.findOne(
            { where: { logind: req.headers.authorization,role:'admin' } }
        );
        if (!admin) {
            console.log("error delete course chapter unauthorized\nadmin= ",admin);
            return res.status(404).json();
        }
        await Chapters.destroy({ where: { id: req.params.chapterId,courseId:req.params.id } });
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.log("error server delete course chapter\n",error.message);
        res.status(500).json({ error: error.message });
    }
});