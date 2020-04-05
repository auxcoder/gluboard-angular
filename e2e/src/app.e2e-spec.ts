import {browser, logging} from 'protractor';
import {AppPage} from './app.po';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
    browser.waitForAngularEnabled(false);
  });

  it('should display welcome message', async () => {
    page.navigateTo('/');
    expect(await page.getTitleText('h1')).toEqual('Welcome to APP');
  });

  it('should navigate to About Us page by clicking menu', async () => {
    page.navigateTo('/');
    browser.waitForAngularEnabled(true);

    let navLinks = await page.getAllElements('a');
    navLinks[1].click();
    expect(await page.getTitleText('h1')).toEqual('About Us');
  });

  it('should enter a comment', async () => {
    page.navigateTo('/dishdetails/0');
    browser.waitForAngularEnabled(true);

    setTimeout(async () => {
      expect(await page.getTitleText('#comments')).toEqual('Comments');

      let newAuthor = await page.getElement('input[type=text]');
      newAuthor.sendKeys('Test Author');

      let newComment = await page.getElement('textarea');
      newComment.sendKeys('Some comment content');

      let submit = await page.getElement('button[type=submit]');
      submit.click();

      browser.pause();
    }, 5000);
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
