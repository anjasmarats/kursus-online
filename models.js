const { Sequelize,DataTypes } = require('sequelize');

const sequelize = new Sequelize('kursus_online','postgres','0psqlpassword0',{
    host:'localhost',
    dialect:'postgres'
});

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    email: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    logind:{
        type:DataTypes.CHAR,
        allowNull:false,
    },
    role:{
        type:DataTypes.ENUM('admin','student'),
        defaultValue:'student'
    },
    activation_time:{
        type:DataTypes.JSONB,
    },
    photo:{
        type:DataTypes.TEXT,
    }
});

const Courses = sequelize.define('Courses', {
    courseId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    price:{
        type:DataTypes.FLOAT,
        allowNull:false
    },
    image:{
        type:DataTypes.TEXT,
        allowNull:false
    }
});

const Chapters = sequelize.define('Chapters', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseId: {
        type: DataTypes.INTEGER,
        references: {
            model: Courses,
            key: 'courseId'
        }
    },
    title: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    video:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    thumbnail:{
        type:DataTypes.TEXT,
        allowNull:false
    },
});

const Enrollment = sequelize.define('Enrollment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        }
    },
    courseId: {
        type: DataTypes.INTEGER,
        references: {
            model: Courses,
            key: 'courseId'
        }
    },
});

module.exports = {
    sequelize,
    User,
    Courses,
    Chapters,
    Enrollment
};