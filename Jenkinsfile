#!/usr/bin/env groovy
              
pipeline {

    agent {
        docker {
            image 'node:8'
            args '-u root'
        }
    }
    environment {
        JWT_SECRET = credentials('JWT_SECRET')
        NODE_ENV = credentials('NODE_ENV')
        PORT = credentials('PORT')
        FRONTEND_URL = credentials('FRONTEND_URL')
        DB_NAME = credentials('DB_NAME')
        DB_HOST = credentials('DB_HOST')
        ADMIN = credentials('ADMIN')
        REDISHOST = credentials('REDISHOST')
        ELASTICSEARCH_HOST = credentials('ELASTICSEARCH_HOST')
        ELASTICSEARCH_INDEX = credentials('ELASTICSEARCH_INDEX')
        ENVIRONMENT = credentials('ENVIROMENT')
    }
    stages {
        stage('Build') {
            steps {
                echo 'Building...'
                sh 'npm install'
            }
        }
        stage('Test') {
            steps {
                echo 'Testing...'
                sh 'npm run test'
            }
        }
        stage('Lint') {
            steps {
                echo 'Linting...'
                sh 'npm run lint'
            }
        }
        stage('Coverage Test') {
            steps {
                echo 'Running coverage test...'
                sh 'npm run test:coverage'
            }
        }
    }
}