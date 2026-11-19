const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.post('/', async (req, res, next) => {

  const { pagination, search } = req.body;
  const { actual_page, per_page } = pagination;
  const skip =(actual_page - 1) *  per_page;

  const searchFilter = search !== ''
  ? { 
      $or: [
        { name: { $regex: search, $options: 'i' } }, 
        { description: { $regex: search, $options: 'i' } }, 
        { topic: { $regex: search, $options: 'i' } }, 
        { medium_type: { $regex: search, $options: 'i' } }, 
      ]
    }
  : {};

  // Ottieni i dati paginati
  const list = await mongoose.connection.db
    .collection('useful_links')
    .find(searchFilter)
    .sort({ order: 1 })
    .skip(skip)
    .limit(per_page)
    .toArray();

  // Calcola il totale degli elementi nella collezione
  const totalCount = await mongoose.connection.db
    .collection('useful_links')
    .countDocuments();

  // Calcola il numero totale di pagine
  const totalPages = Math.ceil(totalCount / per_page);

  // Calcola se siamo sulla prima o ultima pagina
  const isFirstPage = actual_page === 1;
  const isLastPage = actual_page === totalPages;

  // Calcola l'intervallo di 5 pagine fisse
  const pagesPerWindow = 5; // Numero di pagine per intervallo
  const startPage = Math.floor((actual_page - 1) / pagesPerWindow) * pagesPerWindow + 1;
  const endPage = Math.min(startPage + pagesPerWindow - 1, totalPages);

  // Genera l'array con le pagine visibili (da startPage a endPage)
  let visiblePages = [];
  for (let i = startPage; i <= endPage; i++) {
    visiblePages.push(i);
  }

  // Calcola se il gruppo di pagine visibili è il primo o l'ultimo
  const isFirstVisiblePagesGroup = startPage === 1;
  const isLastVisiblePagesGroup = endPage === totalPages;

  // Includi l'array delle pagine visibili e le variabili di paginazione nelle informazioni di risposta
  pagination.totals = totalCount;
  pagination.totalPages = totalPages;
  pagination.visiblePages = visiblePages;
  pagination.isFirstPage = isFirstPage;
  pagination.isLastPage = isLastPage;
  pagination.isFirstVisiblePagesGroup = isFirstVisiblePagesGroup;
  pagination.isLastVisiblePagesGroup = isLastVisiblePagesGroup;

  res.status(200).send({ list, pagination });
});

module.exports = router;
