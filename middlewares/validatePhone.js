const { PhoneNumberFormat, PhoneNumberUtil } = require('google-libphonenumber');

const phoneUtil = PhoneNumberUtil.getInstance();

const validatePhoneNumber = (req, res, next) => {
  let phoneNumber = req.body.id;
  try {
    phoneNumber = phoneUtil.parse(phoneNumber, 'US');
    phoneNumber = phoneUtil.format(phoneNumber, PhoneNumberFormat.INTERNATIONAL);
    req.body.phone = phoneNumber;
    next();
  } catch (err) {
    res.status(400).send({ error: 'Invalid Phone Number Entered' });
  }
};

module.exports = { validatePhoneNumber };
