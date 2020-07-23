const conversionService = require('../services/conversionService')
const smsService = require('../services/smsService')
const Yup = require('yup')
const moment = require('moment')

let smsController = {
  async convertSms (req, res) {
    try {

      let schema = Yup.object().shape({
        sms: Yup.string().required()
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: "Please insert a sms text ou number" })
      }
      
      if(parseInt(req.body.sms[0])) {

        const result = await conversionService.convertNumberToText(req.body.sms)

        if (result.length > 255) return res.json({ 
          error: 'Please insert 255 or less caracters'
        })

        const { original, converted, createdAt } = await smsService.create(req.body.sms, result)
        
        return res.status(200).json({
          original,
          converted,
          date: moment(createdAt).format('DD/MM/YYYY')
        })
      }

      if (req.body.sms.length > 255) return res.json({ 
        error: 'Please insert 255 or less caracters'
      })

      const result = await conversionService.convertTextToNumber(req.body.sms)

      const { original, converted, createdAt } = await smsService.create(req.body.sms, result)
        
      return res.status(200).json({
        original,
        converted,
        date: moment(createdAt).format('DD/MM/YYYY')
      })

    } catch (err) {
      return res.status(400).json({ error: 'An error has ocurred' })
    }
  },

  async listSms (req, res) {

    try{
      const { page = 1, date } = req.query

      if (date) {
        const listOfSms = await smsService.listByDate(page, date)

        return res.status(200).json(listOfSms)
      }

      const listOfSms = await smsService.list(page)

      return res.status(200).json(listOfSms)
      
    } catch (err) {
      return res.status(400).json({ error: 'It was not possible to find any data' })
    }
    
  }
}

module.exports = smsController
