const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // Enable CORS for your GitHub Pages frontend
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', 'https://fratiu.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, primaryName, attending, comments } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const htmlDesign = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: 'Georgia', serif; background-color: #faf9f6; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; border-top: 6px solid #9ca986; text-align: center;">
            <h1 style="color: #4a5d23; font-size: 24px; margin-top: 0; margin-bottom: 20px;">We've Received Your RSVP!</h1>
            
            <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #555555; margin: 0 0 15px 0;">Thank you so much for responding. We can't wait to celebrate with you on <strong style="color: #333333; white-space: nowrap;">October 25, 2026</strong>.</p>
            
            <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #555555; margin: 0 0 15px 0;">Please save this email so you have the venue and parking details handy for the big day.</p>
            
            <div style="background-color: #f4f6f1; border: 1px solid #e1e5db; border-radius: 6px; padding: 25px; margin: 30px 0; text-align: left;">
                <h3 style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin-top: 0; color: #4a5d23; font-size: 16px; margin-bottom: 15px; border-bottom: 1px solid #d0d7c6; padding-bottom: 10px;">📍 Venue & Parking Details</h3>
                
                <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #555555; margin: 0 0 15px 0;"><strong style="color: #333333;">Tapestry Hall</strong><br>74 Grand Ave S, Cambridge, ON</p>
                
                <!-- The Map Image -->
                <div style="text-align: center; margin: 20px 0;">
                    <img src="https://fratiu.github.io/engagement-rsvp/map.png" alt="Tapestry Hall Parking Map" style="max-width: 100%; height: auto; border-radius: 4px; border: 1px solid #d0d7c6; display: block; margin: 0 auto;">
                </div>

                <!-- The Legend -->
                <div style="background-color: #ffffff; border: 1px solid #e1e5db; border-radius: 4px; padding: 15px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #555555; line-height: 1.6;">
                    <div style="margin-bottom: 8px;">
                        <span style="color: #c02b2b; font-size: 16px; margin-right: 5px;">★</span> 
                        <strong>Tapestry Hall</strong> (Venue)
                    </div>
                    <div style="margin-bottom: 8px;">
                        <span style="display: inline-block; background-color: #c02b2b; color: #ffffff; border-radius: 50%; width: 20px; height: 20px; text-align: center; line-height: 20px; font-size: 12px; margin-right: 5px;">1</span> 
                        Free Parking Garage (Grand Ave S)
                    </div>
                    <div style="margin-bottom: 8px;">
                        <span style="display: inline-block; background-color: #c02b2b; color: #ffffff; border-radius: 50%; width: 20px; height: 20px; text-align: center; line-height: 20px; font-size: 12px; margin-right: 5px;">2</span> 
                        Free Parking Lot (Fraser St)
                    </div>
                    <div>
                        <span style="display: inline-block; background-color: #c02b2b; color: #ffffff; border-radius: 50%; width: 20px; height: 20px; text-align: center; line-height: 20px; font-size: 12px; margin-right: 5px;">3</span> 
                        Free Parking Lot (Cedar St)
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 30px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: #888888; border-top: 1px solid #eeeeee; padding-top: 20px;">
                Need to reach us directly?<br>Text Filip (226-792-7905) or Ada (226-751-5369).
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "We've Received Your RSVP!",
            html: htmlDesign
        });

        const makeResponse = await fetch('https://hook.us2.make.com/7vpctcbnrcxwloabqjvrbqee1vq4brnk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        if (!makeResponse.ok) {
            throw new Error('Failed to reach Make.com');
        }

        return res.status(200).send("RSVP logged and email sent successfully!");
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).send("Error processing RSVP");
    }
};