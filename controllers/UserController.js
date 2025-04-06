const { app } = require('../server');
const { User } = require('../models');
const bcryptjs = require('bcryptjs');

app.post('/api/user', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!req.body||!name || !email || !password) {
            console.log("error post user data tidak lengkap\nreq.body= ",req.body);
            return res.status(400).json();
        }
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
        const hashedPassword = await bcryptjs.hash(password, 10);
        return res.status(201).json({data:logind});
    } catch (error) {
        console.log("error server post user\n",error.message);
        return res.status(500).json({ error: error.message });
    }
});

app.get('/api/user/:id', async (req, res) => {
    try {
        if (!req.params.id || !req.headers.authorization) {
            console.log("error get user data unauthorized\nreq.params= ",req.params,"req.headers= ",req.headers.authorization);
            return res.status(400).json();
        }
        const admin = await User.findOne(
            { where: { logind: req.headers.authorization.split(' ')[1],role:'admin' } }
        );
        if (!admin) {
            console.log("error get user unauthorized\nadmin= ",admin);
            return res.status(404).json({ data:false });
        }
        // Find user by ID
        const users = await User.findOne(
            { where: { id: req.params.id } }
        );
        return res.status(200).json({users});
    } catch (error) {
        console.log("error server get user\n",error.message);
        return res.status(500).json({ error: error.message });
    }
});

app.put('/api/user/:id', async (req, res) => {
    try {
        if (!req.params.id || !req.headers.authorization) {
            console.log("error put user unauthorized\nreq.params= ",req.params,"\nreq.headers= ",req.headers.authorization);
            return res.status(400).json();
        }
        const { name, email, password, role } = req.body;
        
        const isUserExist = await User.findOne(
            { where: { logind:req.headers.authorization.split(' ')[1] } }
        );

        const cekPassword = await bcryptjs.compare(password, isUserExist?isUserExist.password:"");
        
        if (!req.body || !name || !email || !password || !req.headers.authorization || !isUserExist || !cekPassword ) {
            console.log("error put user data tidak lengkap\nreq.body= ",req.body,"cekpassword= ",cekPassword,"isuserexist= ",isUserExist);
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
        console.log("error server put user\n",error.message);
        return res.status(500).json({ error: error.message });
    }
});

app.delete('/api/user/:id', async (req, res) => {
    try {
        if (!req.params.id || !req.headers.authorization) {
            console.log("error delete user data tidak lengkap\nreq.params= ",req.params,"\nreq.headers= ",req.headers.authorization);
            return res.status(400).json();
        }
        const admin = await User.findOne(
            { where: { logind: req.headers.authorization.split(' ')[1],role:'admin' } }
        );
        if (!admin) {
            console.log("error delete user unauthorized\nadmin= ",admin);
            return res.status(404).json();
        }
        // Find user by ID
        await User.destroy(
            { where: { id: req.params.id } }
        );
        return res.status(200).json();
    } catch (error) {
        console.log("error server delete user\n",error.message);
        return res.status(500).json({ error: error.message });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const admin = await User.findOne(
            { where: { role: 'admin',logind:req.headers.authorization.split(' ')[1] } }
        );
        if (!req.headers.authorization ||!admin) {
            console.log("error get users data tidak lengkap\nreq.headers= ",req.headers,"admin= ",admin);
            return res.status(400).json({ error: 'Admin not found' });
        }
        // Find all users
        const users = await User.findAll();
        return res.status(200).json(users);
    } catch (error) {
        console.log("error server get users\n",error.message);
        return res.status(500).json({ error: error.message });
    }
});

app.get('/api/auth', async (req, res) => {
    try {
        if (!req.headers.authorization) {
            console.log("error get auth data tidak lengkap\nreq.headers= ",req.headers.authorization);
            return res.status(400).json();
        }
        const user = await User.findOne(
            { where: { logind: req.headers.authorization } }
        );
        if (!user) {
            console.log("error get auth unauthorized\nuser= ",user);
            return res.status(404).json({ data:false });
        }
        return res.status(200).json({data:true,admin:user.role==='admin'});
    } catch (error) {
        console.log("error server get auth\n",error.message);
        return res.status(500).json({ error: error.message });
    }
});

app.get('/api/user', async (req, res) => {
    try {
        if (!req.headers.authorization) {
            console.log("error get user data tidak lengkap\nreq.headers= ",req.headers.authorization);
            return res.status(400).json();
        }
        const user = await User.findOne(
            {
                attributes: ['name','email','logind','activation_time','photo'],
                where: { logind: req.headers.authorization.split('')[1] } 
            }
        );
        if (!user) {
            console.log("error get user unauthorized\nuser= ",user);
            return res.status(404).json({ data:false });
        }
        return res.status(200).json({user});
    } catch (error) {
        console.log("error server get user\n",error.message);
        return res.status(500).json({ error: error.message });
    }
});