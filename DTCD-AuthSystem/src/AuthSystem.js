import { SystemPlugin, LogSystemAdapter, InteractionSystemAdapter } from './../../DTCD-SDK';
import { version } from '../package.json';

export class AuthSystem extends SystemPlugin {
  #guid;
  #logSystem;
  #interactionSystem;
  #isLogged = false;

  /**
   * @constructor
   * @param {String} guid guid of system instance
   */
  constructor(guid) {
    super();
    this.#guid = guid;
    this.#logSystem = new LogSystemAdapter('0.5.0', this.#guid, 'AuthSystem');
    this.#interactionSystem = new InteractionSystemAdapter('0.4.0');
  }

  async init() {
    const { data: response } = await this.#interactionSystem.GETRequest('/auth/isloggedin');
    if (response.status) {
      this.#isLogged = true;
      return;
    }
    this.#isLogged = false;
  }

  /**
   * Returns meta information about plugin for registration in application
   * @returns {Object} - meta-info
   */
  static getRegistrationMeta() {
    return {
      type: 'core',
      title: 'Система аутентификации',
      name: 'AuthSystem',
      version,
      withDependencies: false,
      priority: 1.5,
    };
  }

  /**
   * Returns guid of AuthSystem instance
   * @returns {String} - guid
   */
  get guid() {
    return this.#guid;
  }

  get isLoggedIn() {
    return this.#isLogged;
  }

  async authorize(login, password) {
    let response = await this.#interactionSystem.POSTRequest('/auth/login', {
      login,
      password,
    });

    if (response.status === 200) {
      this.#logSystem.info(`Success authorize with ${login} account`);
      this.#logSystem.debug(`Success authorize with ${login} account`);
      await this.#logSystem.setUsername();
      this.#isLogged = true;
      return this.#isLogged;
    }

    this.#isLogged = false;
    return this.#isLogged;
  }

  async logout() {
    await this.#interactionSystem.DELETERequest('/auth/logout');
    this.#logSystem.info(`Success logout`);
    this.#logSystem.debug(`Success logout`);
    await this.#logSystem.setUsername();
    this.#isLogged = false;
    Application.getSystem('RouteSystem', '0.1.0').navigate('/login');
  }
}
