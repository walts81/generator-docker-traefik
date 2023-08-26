'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const _ = require('underscore.string');

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(
        `Welcome to the unreal ${chalk.red(
          'generator-docker-traefik'
        )} generator!`
      )
    );

    const prompts = [
      {
        type: 'input',
        name: 'serviceName',
        message: 'What is your service name?',
      },
      {
        type: 'confirm',
        name: 'customComposeName',
        message:
          'Would you like the docker compose file to be named using the service name?',
        default: false,
      },
      {
        type: 'input',
        name: 'composeVersion',
        message: 'What is the version of the docker compose yaml spec?',
        default: '3',
      },
      {
        type: 'input',
        name: 'imageName',
        message: 'What docker image would you like to use?',
      },
      {
        type: 'input',
        name: 'containerName',
        message: 'What would you like to call the container?',
        default: a => _.slugify(a.serviceName),
      },
      {
        type: 'confirm',
        name: 'hasAppData',
        message: 'Would you like to map app data?',
        default: true,
      },
      {
        type: 'input',
        name: 'appDataDir',
        message: 'Where is your appdata dir located?',
        default: (process.env.USER_PROFILE || process.env.HOME) + '/appdata',
        store: true,
      },
      {
        type: 'confirm',
        name: 'hasInternal',
        message: 'Would you like Traefik to wire up internal network routes?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'hasExternal',
        message: 'Would you like Traefik to wire up external network routes?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'requiresAuth',
        when: a => a.hasExternal,
        message: 'Would you like to protect this service by oauth?',
        default: true,
      },
      {
        type: 'input',
        name: 'servicePort',
        message: 'What port does your service listen on?',
        default: '80',
      },
      {
        type: 'input',
        name: 'subdomain',
        message: 'What would you like the sub-domain to be?',
        default: a => _.slugify(a.serviceName),
      },
      {
        type: 'input',
        name: 'localDomain',
        when: a => a.hasInternal,
        message: 'What is your internal domain?',
        store: true,
      },
      {
        type: 'input',
        name: 'cloudDomain',
        when: a => a.hasExternal,
        message: 'What is your external domain?',
        store: true,
      },
    ];

    return this.prompt(prompts).then(props => {
      if (!props.subdomain) props.subdomain = '$SUB_DOMAIN';
      if (!props.localDomain) props.localDomain = '$DOMAIN_LOCAL';
      if (!props.cloudDomain) props.cloudDomain = '$DOMAIN_CLOUD';
      if (!!props.appDataDir && !props.appDataDir.endsWith('/'))
        props.appDataDir += '/';
      props.serviceNameSlug = _.slugify(props.serviceName);
      props.containerName = _.slugify(props.containerName);
      this.props = props;
    });
  }

  writing() {
    const filename =
      (this.props.customComposeName
        ? this.props.serviceNameSlug
        : 'docker-compose') + '.yaml';
    this.fs.copyTpl(
      this.templatePath('docker-compose.yaml'),
      this.destinationPath(filename),
      this.props
    );
  }
};
