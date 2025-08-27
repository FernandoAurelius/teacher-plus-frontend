describe('Quiz Run', () => {
  it('should display a success toast when the correct answer is selected', () => {
    // Visit the quiz page
    cy.visit('/quiz/run');

    // Mock the API call to load the quiz questions
    cy.intercept('GET', '/api/quiz', { fixture: 'quiz.json' });

    // Select the correct answer
    cy.get('[data-cy=answer-button-correct]').click();

    // Check if the toast is visible
    cy.get('[data-sonner-toast]').should('be.visible');
    cy.get('[data-sonner-toast]').contains('Correct Answer!');
  });
});
