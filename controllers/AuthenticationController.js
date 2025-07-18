const { Leader } = require('../models')

const config = require('../config/config')
const jwt = require('jsonwebtoken')

function jwtSignUser(user) {
    const ONE_DAY = 60 * 60 * 24 
    return jwt.sign(user, config.authentication.jwtSecret, {
        expiresIn: ONE_DAY
    }) 
}

module.exports = {

    async register(req, res) {
        try {
           
            req.body.isAdmin = true;
            const leader = await Leader.create(req.body);
     
            return res.send({ id: leader.id })
        } catch (err) {
            return res.status(400).send({
                error: 'This account is already in use. '+err   
            })
        } 
    },   

    async registerMember(req, res) {
        try {
           req.body.role = 'user'; // Assurez-vous que le rôle est défini pour les membres
              if (req.body.supervisorId && typeof req.body.supervisorId === 'object') {
      req.body.supervisorId = req.body.supervisorId.id;
    }
          console.log("Registering member with data:", req.body);

           const leader = await Leader.create(req.body);
  
     
            return res.send({ id: leader.id })
        } catch (err) {
            return res.status(400).send({
                error: 'This account is already in use. '+err   
            })
        } 
    },
async login(req, res) {
  try {
    const { username, password } = req.body;
    console.log(username, password, "here");

    const leader = await Leader.findOne({
      where: {
        username: username,
        password: password, // ⚠️ En production, hash le mot de passe !
      }
    });

    if (!leader) {
      return res.status(403).send({
        error: 'Informations de connexion incorrectes.'
      });
    }
   
  console.log("Leader found:", leader);

    // Réponse à renvoyer côté frontend
    const newUser = {
      id: leader.id,
      firstName: leader.firstName,
      lastName: leader.lastName,
      username: leader.username,
      phoneNo: leader.phoneNo,
      isAdmin: leader.isAdmin,
      progression: leader.progression,
      supervisorId: leader.supervisorId,
      role: leader.role,
    };

    res.send({ user: newUser ,token: jwtSignUser(newUser) });

  } catch (err) {
    res.status(500).send({
      error: 'Une erreur est survenue lors de la connexion : ' + err
    });
  }
},


    
    async updatePassword(req, res) {
        try {
            const leader = await Leader.update(req.body, {
                where: {
                    id: req.user.id
                }
            })
            res.send(leader)
        } catch (err) {
            console.error('Error updating password:', err);
            res.status(500).send({
                error: "An error occured when trying to update the password. " + err.message
            })
        }
    },
}