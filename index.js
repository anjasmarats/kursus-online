const { app } = require('./server');
const { sequelize } = require('./models');

sequelize.sync({ force: false }).then(() => {
    console.log('Database & tables created!');
});

import('./controllers/UserController.js');
import('./controllers/CourseController.js');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});