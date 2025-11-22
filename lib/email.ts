import sgMail from '@sendgrid/mail'

if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export async function sendNotification(
    to: string,
    residentName: string,
    lockerNumber: string,
    pin: string,
    pickupLink: string
) {
    const msg = {
        to,
        from: 'abishekkanageswaran70@gmail.com', // Verified sender
        subject: 'You have a package!',
        text: `Hello ${residentName},\n\nYou have a package in Locker ${lockerNumber}.\nYour PIN is: ${pin}\n\nView details: ${pickupLink}\n\nPlease pick it up within 48 hours.`,
        html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>You have a package!</h2>
        <p>Hello ${residentName},</p>
        <p>Your package is ready for pickup in <strong>Locker ${lockerNumber}</strong>.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #666;">Your PIN Code:</p>
          <p style="margin: 5px 0 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">${pin}</p>
        </div>
        <p><a href="${pickupLink}" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Pickup Details</a></p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">Please pick up your package within 48 hours.</p>
      </div>
    `,
    }

    if (process.env.SENDGRID_API_KEY) {
        try {
            await sgMail.send(msg)
            console.log('Email sent to', to)
        } catch (error) {
            console.error('Error sending email', error)
        }
    } else {
        console.log('Mock Email Sent:', JSON.stringify(msg, null, 2))
    }
}
