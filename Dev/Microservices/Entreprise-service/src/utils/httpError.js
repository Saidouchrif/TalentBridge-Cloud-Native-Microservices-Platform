function creerErreurHttp(codeStatut, message) {
  const erreur = new Error(message);
  erreur.statusCode = codeStatut;
  return erreur;
}

module.exports = { creerErreurHttp };
