import { headerComponentHTML } from './components/header';
import { footerComponentHTML } from './components/footer';

document.querySelector('header').innerHTML = headerComponentHTML();
document.querySelector('footer').innerHTML = footerComponentHTML();