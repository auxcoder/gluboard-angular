import {browser, by, element} from 'protractor';

export class AppPage {
  navigateTo(link: string = '') {
    const url = browser.baseUrl + link;
    return browser.get(url);
  }

  async getTitleText(selector: string) {
    return await element(by.css(selector)).getText();
  }

  async getElement(selector: string) {
    return await element(by.css(selector));
  }

  async getAllElements(selector: string) {
    return await element.all(by.css(selector));
  }
}
