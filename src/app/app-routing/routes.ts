import {Routes} from '@angular/router';
import {AboutComponent} from "../about/about.component";
import {ContactComponent} from "../contact/contact.component";
import {HomeComponent} from "../home/home.component";

export const routes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'aboutus', component: AboutComponent},
  {path: 'contactus', component: ContactComponent}
];
