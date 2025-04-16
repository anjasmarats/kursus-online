const { app } = require('./server');
const { sequelize,User,Courses,Chapters,Enrollment } = require('./models');

Courses.hasMany(Chapters, { foreignKey: 'courseId' });
Chapters.belongsTo(Courses, { foreignKey: 'courseId' });
User.belongsToMany(Courses, { through: Enrollment, foreignKey: 'userId' });
Courses.belongsToMany(User, { through: Enrollment, foreignKey: 'courseId' });

sequelize.sync({ force: false }).then(() => {
    console.log('Database & tables created!');
});

import('./controllers/UserController.js');
import('./controllers/CourseController.js');
import("./controllers/ChapterController.js")

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});