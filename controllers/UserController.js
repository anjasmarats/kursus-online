const { app } = require('../server');
const { User } = require('../models');
const bcryptjs = require('bcryptjs');

app.post('/api/login',async(req,res)=>{
    try {
        const { email,password } = req.body
        if (!req.body || !email || !password) {
            console.error("error login user data tidak lengkap\nreq.body = ",req.body,"\nemail = ",email,"\npassword = ",password)
            return res.status(402).json()
        }

        const user = await User.findOne({
            where:{
                email
            }
        })

        if (!user) {
            console.error("error login user, user tidak ada\nuser = ",user)
            return res.status(404).json()
        }

        const cekPassword = await bcryptjs.compare(password,user.password)

        if (!cekPassword) {
            console.error("error login user password salah\npassword = ",password)
            return res.status(400).json()
        }

        const logind = Array.from({length: 255}, () => Math.random().toString(36)[2]).join('');

        await User.update({
            logind,
        },{
            where:{
                email
            }
        })

        return res.status(200).json({data:logind})
    } catch (e) {
        console.error("error server login user\n",e)
        return res.status(500).json()
    }
})

app.get('/api/user/photo', async (req, res) => {
    try {
        if (!req.headers.authorization) {
            console.error("error get course user photo unauthorized\n\nreq.headers= ",req.headers.authorization);
            return res.status(400).json();
        }
        const user = await User.findOne(
            { where: { logind: req.headers.authorization.split(' ')[1] },attributes: ['photo'] }
        );

        if (!user) {
            console.error("error get course user photo unauthorized\nisuserexist= ",user);
            return res.status(400).json();
        }

        const photo = `/public/users/${user.photo}`;
        return res.status(200).download(photo, {
            headers: {
                'Content-Type': 'image/*',
                'Content-Disposition': `attachment; filename=${user.photo}`,
            },
        });
    } catch (error) {
        console.error("error server get user photo\n",error.message);
        return res.status(500).json({ error: error.message });
    }
});

app.post('/api/user', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!req.body||!name || !email || !password) {
            console.error("error post user data tidak lengkap\nreq.body= ",req.body);
            return res.status(400).json();
        }
        const user = await User.findAll({
            where:{
                email
            }
        })

        console.log("user",user)

        if (user.length>0) {
            console.error("error post user, user sudah ada")
            return res.status(400).json()
        }
        const hashedPassword = await bcryptjs.hash(password, 10);
        const logind = Array.from({length: 255}, () => Math.random().toString(36)[2]).join('');
        if (req.files && req.files.image) {
            const image = req.files.image;
            const imagePath = `public/users/${image,'-',image.name}`;
            await image.mv(imagePath);
            await User.create({
                name,
                email,
                password: hashedPassword,
                role,
                photo:`${image,'-',image.name}`,
                logind
            });
        } else {
            await User.create({
                name,
                email,
                password: hashedPassword,
                role,
                logind
            });
        }
        return res.status(201).json({data:logind});
    } catch (error) {
        console.error("error server post user\n",error.message);
        return res.status(500).json({ error: error.message });
    }
});

app.get('/api/user/:id', async (req, res) => {
    try {
        if (!req.params.id || !req.headers.authorization) {
            console.error("error get user data unauthorized\nreq.params= ",req.params,"req.headers= ",req.headers.authorization);
            return res.status(400).json();
        }
        const admin = await User.findOne(
            { where: { logind: req.headers.authorization.split(' ')[1],role:'admin' } }
        );
        if (!admin) {
            console.error("error get user unauthorized\nadmin= ",admin);
            return res.status(404).json({ data:false });
        }
        // Find user by ID
        const users = await User.findOne(
            { where: { id: req.params.id } }
        );
        return res.status(200).json({users});
    } catch (error) {
        console.error("error server get user\n",error.message);
        return res.status(500).json({ error: error.message });
    }
});

app.put('/api/user/:id', async (req, res) => {
    try {
        if (!req.params.id || !req.headers.authorization) {
            console.error("error put user unauthorized\nreq.params= ",req.params,"\nreq.headers= ",req.headers.authorization);
            return res.status(400).json();
        }
        const { name, email, password, role } = req.body;
        
        const isUserExist = await User.findOne(
            { where: { logind:req.headers.authorization.split(' ')[1] } }
        );

        const cekPassword = await bcryptjs.compare(password, isUserExist?isUserExist.password:"");
        
        if (!req.body || !name || !email || !password || !req.headers.authorization || !isUserExist || !cekPassword ) {
            console.error("error put user data tidak lengkap\nreq.body= ",req.body,"cekpassword= ",cekPassword,"isuserexist= ",isUserExist);
            return res.status(400).json();
        }
        const hashedPassword = await bcryptjs.hash(password, 10);
        if (req.files && req.files.image) {
            const image = req.files.image;
            const imagePath = `public/users/${image,'-',image.name}`;
            await image.mv(imagePath);
            await User.update(
                { name, email, password:hashedPassword, role, photo:`${image,'-',image.name}` },
                { where: { id: req.params.id } }
            );
        } else {
            await User.update(
                { name, email, password:hashedPassword, role },
                { where: { id: req.params.id } }
            );
        }
        // Find user by ID
        return res.status(200).json();
    } catch (error) {
        console.error("error server put user\n",error.message);
        return res.status(500).json({ error: error.message });
    }
});

app.delete('/api/user/:id', async (req, res) => {
    try {
        if (!req.params.id || !req.headers.authorization) {
            console.error("error delete user data tidak lengkap\nreq.params= ",req.params,"\nreq.headers= ",req.headers.authorization);
            return res.status(400).json();
        }
        const admin = await User.findOne(
            { where: { logind: req.headers.authorization.split(' ')[1],role:'admin' } }
        );
        if (!admin) {
            console.error("error delete user unauthorized\nadmin= ",admin);
            return res.status(404).json();
        }
        // Find user by ID
        await User.destroy(
            { where: { id: req.params.id } }
        );
        return res.status(200).json();
    } catch (error) {
        console.error("error server delete user\n",error.message);
        return res.status(500).json({ error: error.message });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const admin = await User.findOne(
            { where: { role: 'admin',logind:req.headers.authorization.split(' ')[1] } }
        );
        if (!req.headers.authorization ||!admin) {
            console.error("error get users data tidak lengkap\nreq.headers= ",req.headers,"admin= ",admin);
            return res.status(400).json({ error: 'Admin not found' });
        }
        // Find all users
        const users = await User.findAll();
        return res.status(200).json(users);
    } catch (error) {
        console.error("error server get users\n",error.message);
        return res.status(500).json({ error: error.message });
    }
});

app.get('/api/auth', async (req, res) => {
    try {
        if (!req.headers.authorization) {
            console.error("error get auth data tidak lengkap\nreq.headers= ",req.headers.authorization);
            return res.status(400).json();
        }
        const user = await User.findOne(
            { where: { logind: req.headers.authorization } }
        );
        if (!user) {
            console.error("error get auth unauthorized\nuser= ",user);
            return res.status(404).json({ data:false });
        }
        return res.status(200).json({data:true,admin:user.role==='admin'});
    } catch (error) {
        console.error("error server get auth\n",error.message);
        return res.status(500).json({ error: error.message });
    }
});

app.get('/api/user', async (req, res) => {
    try {
        if (!req.headers.authorization) {
            console.error("error get user data tidak lengkap\nreq.headers= ",req.headers.authorization);
            return res.status(400).json();
        }

        console.log("logind",req.headers.authorization.split(' '[1]))

        const user = await User.findOne(
            {
                attributes: ['name','email','activation_time','photo'],
                where: { logind: req.headers.authorization.split('')[1] } 
            }
        );

        console.log("user",user)

        if (!user) {
            console.error("error get user unauthorized\nuser= ",user);
            return res.status(404).json({ data:false });
        }
        return res.status(200).json({user});
    } catch (error) {
        console.error("error server get user\n",error.message);
        return res.status(500).json({ error: error.message });
    }
});