export const resetPasswordCodeHtml = (code: number) => {
  return `<!DOCTYPE html
 PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
 <html xmlns="http://www.w3.org/1999/xhtml">
 
 <head>
 <meta name="viewport" content="width=device-width, initial-scale=1.0" />
 <meta name="x-apple-disable-message-reformatting" />
 <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
 <meta name="color-scheme" content="light dark" />
 <meta name="supported-color-schemes" content="light dark" />
 <title></title>
 <style type="text/css" rel="stylesheet" media="all">
   /* Base ------------------------------ */
 
   @import url("https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&display=swap");
 
   body {
     width: 100% !important;
     height: 100%;
     margin: 0;
     -webkit-text-size-adjust: none;
     font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
   }
 
   a img {
     border: none;
   }
 
   td {
     word-break: break-word;
   }
 
   .preheader {
     display: none !important;
     visibility: hidden;
     mso-hide: all;
     font-size: 1px;
     line-height: 1px;
     max-height: 0;
     max-width: 0;
     opacity: 0;
     overflow: hidden;
   }
 
   /* Type ------------------------------ */
 
   h4 {
     color: #333333;
     font-size: 22px;
     font-weight: bold;
     text-align: center;
     margin: 25px 45px 25px 45px;
   }
 
   td,
   th {
     font-size: 16px;
   }
 
   p {
     color: #51545E;
     line-height: 1.625;
     font-size: 15px;
     margin: 25px 45px 25px 45px;
   }
 
   p,
   .help-phrase {
     font-size: 12px;
   }
 
   p .sub {
     font-size: 13px;
   }
 
   /* Buttons ------------------------------ */
 
   .button {
     background-color: #0077E6;
     border: 10px solid: #0077E6;
     display: inline-block;
     color: #FFF;
     text-decoration: none;
     font-size: 30px;
     border-radius: 3px;
     -webkit-text-size-adjust: none;
     box-sizing: border-box;
     margin-bottom: 0
   }
 
 
   #logo {
     max-width: 350px;
   }
 
   .email-wrapper {
     width: 100%;
     margin: 0;
     padding-top: 25px;
     -premailer-width: 100%;
     -premailer-cellpadding: 0;
     -premailer-cellspacing: 0;
   }
 
   .email-masthead {
     background-color: #212125;
     padding: 25px 0;
   }
 
   .email-content {
     background-color: #F2F4F6;
     width: 570px;
     margin: 0;
     padding: 0;
     -premailer-width: 100%;
     -premailer-cellpadding: 0;
     -premailer-cellspacing: 0;
   }
 
   /* Body ------------------------------ */
 
   .email-body {
     width: 100%;
     margin: 0;
     padding: 0;
     -premailer-width: 100%;
     -premailer-cellpadding: 0;
     -premailer-cellspacing: 0;
   }
 
   .email-body_inner {
     width: 570px;
     margin: 0 auto;
     padding: 0;
     -premailer-width: 570px;
     -premailer-cellpadding: 0;
     -premailer-cellspacing: 0;
     background-color: #FFFFFF;
   }
 
   .email-footer {
     width: 570px;
     margin: 0 auto;
     padding: 0;
     -premailer-width: 570px;
     -premailer-cellpadding: 0;
     -premailer-cellspacing: 0;
     text-align: center;
   }
 
   .email-footer p {
     color: #A8AAAF;
     margin: 0 auto;
     padding-top: 25px;
   }
 
   .body-action {
     width: 100%;
     margin: 30px auto;
     padding: 0;
     -premailer-width: 100%;
     -premailer-cellpadding: 0;
     -premailer-cellspacing: 0;
     text-align: center;
   }
 
   /*Media Queries ------------------------------ */
 
   @media only screen and (max-width: 600px) {
     #logo {
       max-width: 250px;
     }
 
     h1 {
       margin: 20px 25px 20px 25px;
       color: #333333;
       font-size: 18px;
       font-weight: bold;
       text-align: left;
     }
 
     .button {
       width: 50% !important;
       text-align: center !important;
     }
 
     p,
     .help-phrase {
       margin: 20px 25px 20px 25px;
     }
 
     .email-footer p {
       padding: 20px 25px;
     }
 
     p .sub {
       font-size: 8px
     }
 
   }
 </style>
 
 </head>
 
 <body style="background-color: #F2F4F6">
 <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
   <tr>
     <td align="center">
       <table class="email-content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <!-- TODO: logo <tr>
           <td class="email-masthead" align="center">
             <a href="https://merge.wirdo.com.br/" class="f-fallback email-masthead_logo">
               <p>
                 <img id="logo" width="100%" src="https://imagizer.imageshack.com/img924/8688/DgNqSd.png">
               </p>
             </a>
           </td>
         </tr> -->
         <!-- Email Body -->
         <tr>
           <td class="email-body" width="570" cellpadding="0" cellspacing="0">
             <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0"
               role="presentation">
               <!-- Body content -->
               <tr>
                 <td>
                   <div class="f-fallback">
                     <span class="preheader">Use esse email para recuperar sua senha.</span>
 
                     <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0"
                       role="presentation">
                       <tr>
                         <td align="center">
                           <h4>Olá, recentemente você solicitou a recuperação de sua senha.</h4>
                           <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                             <tr>
                               <td align="center" style="border-bottom: 1px solid #A8AAAF; padding-bottom: 20px">
                                 <p>Seu código de recuperação:</p>
                                 <p class="f-fallback button" target="_blank">${code}</h2>
                               </td>
                             </tr>
                           </table>
                         </td>
                       </tr>
                     </table>
                     <p class="help-phrase">Se você não solicitou essa recuperação, por favor contate o suporte do
                       GDT.</p>
                   </div>
                 </td>
               </tr>
             </table>
           </td>
         </tr>
         <tr>
           <td>
             <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0"
               role="presentation">
               <tr>
                 <td style="padding: 0 0 25px 0;" align="center">
                   <p style="" class="f-fallback sub align-center">
                     Wirdo - CNPJ: 50.122.641/0001-97
                     <br> Telefone: (49) 3960-1210
                   </p>
                 </td>
               </tr>
             </table>
           </td>
         </tr>
       </table>
     </td>
   </tr>
 </table>
 </body>
 
 </html>
 `
}
