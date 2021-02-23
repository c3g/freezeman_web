/// <reference types="cypress" />

// Fixtures:
//  - credentials.json
//  - Container_creation_v0.4.xlsx
//  - Container_move_v0.4.xlsx
//  - Container_rename_v0.1.xlsx
//  - Extraction_v0.8.xlsx
//  - Sample_submission_v0.11.xlsx
//  - Sample_submission_v0.9.1_AB.xlsx
//  - Sample_update_v0.5.xlsx

context('All tests', () => {

  // Helpers
  const getCredentials = () =>
    cy.fixture('credentials')

  const login = (credentials) => {
    cy.get('[autocomplete=username]').type(credentials.user)
    cy.get('input[type=password]').type(credentials.password)
    cy.get('form').submit()
  }

  // Tests
  beforeEach(() => {
    cy.visit('http://localhost:9000/sign-in')
  })

  it('logs in', () => {
    getCredentials().then(login)
    cy.url().should('contain', '/dashboard')
    // cy.contains('Welcome, Admin')
  })

  it('creates containers', () => {
    getCredentials().then(login)
    cy.get('li').contains('Containers').click()
    cy.get('button').contains('Add Containers').click()
    cy.get('input[type=file]').attachFile('Container_creation_v0.4.xlsx')
    cy.get('button').contains('Submit').click()
    cy.get('.ant-alert-success').should('contain', 'Template submitted')
    cy.get('button').contains('Go Back').click()
    cy.get('body').should('contain', '1-10 of 14 items')
  })

  it('creates samples', () => {
    getCredentials().then(login)
    cy.get('li').contains('Samples & Extractions').click()
    cy.get('button').contains('Add Samples').click()
    cy.get('input[type=file]').attachFile('Sample_submission_v0.9.1_AB.xlsx')
    cy.get('button').contains('Submit').click()
    cy.get('.ant-alert-success').should('contain', 'Template submitted')
    cy.get('button').contains('Go Back').click()
    cy.get('body').should('contain', '1-8 of 8 items')
  })


  // Examples

  // it('invites users', () => {
  //   login()
  //   cy.get('[href="/admin/users"]').click()
  //   cy.url()
  //     .should('contain', '/admin/users')
  //   cy.log('Creating email account...')
  //   cy.wait(1000)

  //   cy.task('ethereal__create')
  //     .then(result => {
  //       createdAccount = result

  //       cy.log('Created email account: ' + createdAccount.username)

  //       cy.get('#email')
  //         .type(createdAccount.username)
  //       cy.get('form').submit()

  //       cy.contains(createdAccount.username)
  //     })
  // })

  // it('can sign up', () => {
  //   cy.task('ethereal__findSignUpLink', createdAccount)
  //     .then(url => {
  //       cy.visit(url)

  //       const [firstName, lastName] = createdAccount.name.split(' ')
  //       const lab = 'Bourque'
  //       const institution = 'McGill'
  //       const institutionAddress = '704 Dr. Penfield'

  //       cy.get('#password').type(createdAccount.password)
  //       cy.get('#firstName').type(firstName)
  //       cy.get('#lastName').type(lastName)
  //       cy.get('#lab').type(lab)
  //       cy.get('#institution').type(institution)
  //       cy.get('#institutionAddress').type(institutionAddress)

  //       cy.get('form').submit()

  //       cy.contains(`Welcome, ${firstName}`)
  //       cy.get('#firstName').should('have.value', firstName)
  //       cy.get('#lastName').should('have.value', lastName)
  //       cy.get('#lab').should('have.value', lab)
  //       cy.get('#institution').should('have.value', institution)
  //       cy.get('#institutionAddress').should('have.value', institutionAddress)
  //     })
  // })
})
