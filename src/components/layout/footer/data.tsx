import {
  IoLogoInstagram,
  IoLogoTwitter,
  IoLogoFacebook,
  IoLogoYoutube,
} from 'react-icons/io5'

export const footer = {
  widgets: [
    {
      id: 2,
      widgetTitle: 'Office',
      lists: [
        {
          id: 1,
          title: 'Hanoi Office',
          // path: '/contact-us',
        },
        {
          id: 2,
          title: '253 Au Co street, Quang An ward, Tay Ho district, Hanoi city, Vietnam',
          // path: 'to:leduylam@gmail.com',
        },
        {
          id: 3,
          title: 'Ho Chi Minh Office',
          // path: '/contact-us',
        },
        {
          id: 4,
          title: '5th floor Green Pax building, no. 216 Tran Nao street, quarter 2, An Khanh ward, Thu Duc city, Ho Chi Minh city, Vietnam',
          // path: 'to:leduylam@gmail.com',
        },
      ],
    },
    {
      id: 4,
      widgetTitle: 'About Us',
      lists: [
        {
          id: 1,
          title: 'Dynamic Sports Company LTD is the exclusive distributor in Vietnam and Cambodia for some of the biggest brands in the golfing world today. Cobra Puma Golf, US Kids Golf, Greg Norman Apparel, PRG Accessories, Ahead Caps and Sundog eyewear. For a full list of retailers stocking our brands, please click on the \"Retailer Locator\" tab.',
          // path: '/faq',
        },
      ],
    },
    {
      id: 5,
      widgetTitle: 'Tools',
      lists: [
        {
          id: 1,
          title: 'Retailer Locator',
          path: '/retailer-locator',
        },
        {
          id: 2,
          title: 'Puma Apparel Sizing chart',
          path: '/puma-apparel-sizing-chart',
        },
        {
          id: 3,
          title: 'Puma Shoe Sizing chart',
          path: '/puma-shoe-sizing-chart',
        },
        {
          id: 4,
          title: 'Greg Norman Apparel Sizing chart',
          path: 'greg-norman-apparel-sizing-chart',
        },
        {
          id: 5,
          title: 'US Kids Golf Sizing chart',
          path: '/us-kids-golf-sizing-chart',
        },
        {
          id: 6,
          title: 'Custom Product',
          path: 'https://wildsidevn.com/',
        },
        {
          id: 7,
          title: 'Register as a Retailer',
          path: '/register-as-a-retailer',
        },
      ],
    },
    {
      id: 1,
      widgetTitle: 'Socials',
      lists: [
        {
          id: 1,
          title: 'Instagram',
          path: 'https://www.instagram.com/dynamicsportsvietnam/',
          icon: <IoLogoInstagram />,
        },
        {
          id: 3,
          title: 'Facebook',
          path: 'https://www.facebook.com/profile.php?id=61573007002622',
          icon: <IoLogoFacebook />,
        },
        {
          id: 4,
          title: 'Youtube',
          path: 'https://www.youtube.com/@dynamicsportsvietnam9443',
          icon: <IoLogoYoutube />,
        },
      ],
    },
  ],
  payment: [
    {
      id: 1,
      path: '/',
      image: '/assets/images/payment/mastercard.svg',
      name: 'payment-master-card',
      width: 34,
      height: 20,
    },
    {
      id: 2,
      path: '/',
      image: '/assets/images/payment/visa.svg',
      name: 'payment-visa',
      width: 50,
      height: 20,
    },
    {
      id: 3,
      path: '/',
      image: '/assets/images/payment/paypal.svg',
      name: 'payment-paypal',
      width: 76,
      height: 20,
    },
    {
      id: 4,
      path: '/',
      image: '/assets/images/payment/jcb.svg',
      name: 'payment-jcb',
      width: 26,
      height: 20,
    },
    {
      id: 5,
      path: '/',
      image: '/assets/images/payment/skrill.svg',
      name: 'payment-skrill',
      width: 39,
      height: 20,
    },
  ],
}

export const footerContemporary = {
  widgets: [
    {
      id: 0,
      isCompanyIntroduction: true,
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',

      lists: [
        {
          id: 1,
          title: 'link-instagram',
          path: 'https://www.instagram.com/redqinc/',
          icon: <IoLogoInstagram />,
        },
        {
          id: 2,
          title: 'link-twitter',
          path: 'https://twitter.com/redqinc',
          icon: <IoLogoTwitter />,
        },
        {
          id: 3,
          title: 'link-facebook',
          path: 'https://www.facebook.com/redqinc/',
          icon: <IoLogoFacebook />,
        },
        {
          id: 4,
          title: 'link-youtube',
          path: 'https://www.youtube.com/channel/UCjld1tyVHRNy_pe3ROLiLhw',
          icon: <IoLogoYoutube />,
        },
      ],
    },
    {
      id: 1,
      widgetTitle: 'widget-title-social',
      lists: [
        {
          id: 1,
          title: 'link-instagram',
          path: 'https://www.instagram.com/redqinc/',
          icon: <IoLogoInstagram />,
        },
        {
          id: 2,
          title: 'link-twitter',
          path: 'https://twitter.com/redqinc',
          icon: <IoLogoTwitter />,
        },
        {
          id: 3,
          title: 'link-facebook',
          path: 'https://www.facebook.com/redqinc/',
          icon: <IoLogoFacebook />,
        },
        {
          id: 4,
          title: 'link-youtube',
          path: 'https://www.youtube.com/channel/UCjld1tyVHRNy_pe3ROLiLhw',
          icon: <IoLogoYoutube />,
        },
      ],
    },
    {
      id: 2,
      widgetTitle: 'widget-title-contact',
      lists: [
        {
          id: 1,
          title: 'link-contact-us',
          path: '/contact-us',
        },
        {
          id: 2,
          title: 'link-email',
          path: '/',
        },
        {
          id: 3,
          title: 'link-email-two',
          path: '/',
        },
        {
          id: 4,
          title: 'link-phone',
          path: '/',
        },
      ],
    },
    {
      id: 3,
      widgetTitle: 'widget-title-about',
      lists: [
        {
          id: 1,
          title: 'link-support-center',
          path: '/contact-us',
        },
        {
          id: 2,
          title: 'link-customer-support',
          path: '/',
        },
        {
          id: 3,
          title: 'link-about-us',
          path: '/contact-us',
        },
        {
          id: 4,
          title: 'link-copyright',
          path: '/',
        },
      ],
    },
    {
      id: 4,
      widgetTitle: 'widget-title-customer-care',
      lists: [
        {
          id: 1,
          title: 'link-faq',
          path: '/faq',
        },
        {
          id: 2,
          title: 'link-shipping',
          path: '/',
        },
        {
          id: 3,
          title: 'link-exchanges',
          path: '/',
        },
      ],
    },
    {
      id: 5,
      widgetTitle: 'widget-title-our-information',
      lists: [
        {
          id: 1,
          title: 'link-privacy',
          path: '/privacy',
        },
        {
          id: 2,
          title: 'link-terms',
          path: '/terms',
        },
        {
          id: 3,
          title: 'link-return-policy',
          path: '/privacy',
        },
        {
          id: 4,
          title: 'link-site-map',
          path: '/',
        },
      ],
    },
  ],
  payment: [
    {
      id: 1,
      path: '/',
      image: '/assets/images/payment/mastercard.svg',
      name: 'payment-master-card',
      width: 34,
      height: 20,
    },
    {
      id: 2,
      path: '/',
      image: '/assets/images/payment/visa.svg',
      name: 'payment-visa',
      width: 50,
      height: 20,
    },
    {
      id: 3,
      path: '/',
      image: '/assets/images/payment/paypal.svg',
      name: 'payment-paypal',
      width: 76,
      height: 20,
    },
    {
      id: 4,
      path: '/',
      image: '/assets/images/payment/jcb.svg',
      name: 'payment-jcb',
      width: 26,
      height: 20,
    },
    {
      id: 5,
      path: '/',
      image: '/assets/images/payment/skrill.svg',
      name: 'payment-skrill',
      width: 39,
      height: 20,
    },
  ],
}
