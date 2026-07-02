import {
  IoLogoInstagram,
  IoLogoFacebook,
  IoLogoYoutube,
} from 'react-icons/io5'

export const footer = {
  widgets: [
    {
      id: 2,
      widgetTitle: 'widget-title-office',
      lists: [
        {
          id: 1,
          title: 'link-about-office-hn',
          // path: '/contact-us',
        },
        {
          id: 2,
          title: 'link-about-address-hn',
          // path: 'to:leduylam@gmail.com',
        },
        {
          id: 3,
          title: 'link-about-office-hcm',
          // path: '/contact-us',
        },
        {
          id: 4,
          title: 'link-about-address-hcm',
          // path: 'to:leduylam@gmail.com',
        },
      ],
    },
    {
      id: 4,
      widgetTitle: 'link-about-us',
      lists: [
        {
          id: 1,
          title: 'link-about-us-content',
          // path: '/faq',
        },
      ],
    },
    {
      id: 5,
      widgetTitle: 'link-tools',
      lists: [
        {
          id: 1,
          title: 'link-retailler',
          path: '/retailer-locator',
        },
        {
          id: 2,
          title: 'link-puma-apparel-sizing',
          path: '/puma-apparel-sizing-chart',
        },
        {
          id: 3,
          title: 'link-puma-shoes-sizing',
          path: '/puma-shoe-sizing-chart',
        },
        {
          id: 4,
          title: 'link-gn-apparel-sizing',
          path: 'greg-norman-apparel-sizing-chart',
        },
        {
          id: 5,
          title: 'link-us-kid-sizing',
          path: '/us-kids-golf-sizing-chart',
        },
        {
          id: 6,
          title: 'link-custom-product',
          path: 'https://wildside.dynamicsportsvn.com/',
        },
        {
          id: 7,
          title: 'link-register-retailer',
          path: '/register-as-a-retailer',
        },
      ],
    },
    {
      id: 1,
      widgetTitle: 'widget-title-social',
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
