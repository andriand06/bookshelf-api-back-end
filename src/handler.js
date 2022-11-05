const books = require("./books");
const { nanoid } = require("nanoid");
const addBookHandler = (request, h) => {
  try {
    const {
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
    } = request.payload;

    const id = nanoid(16);
    const finished = readPage === pageCount;
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;
    const newBook = {
      id,
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      insertedAt,
      updatedAt,
    };
    books.push(newBook);
    if (!name || readPage > pageCount) {
      let message = "";
      if (!name) {
        message = "Gagal menambahkan buku. Mohon isi nama buku";
      } else if (readPage > pageCount) {
        message =
          "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount";
      }
      const response = h.response({
        status: "fail",
        message: message,
      });
      response.code(400);
      return response;
    } else {
      const isSuccess = books.filter((book) => book.id === id).length > 0;
      if (isSuccess) {
        const response = h.response({
          status: "success",
          message: "Buku berhasil ditambahkan",
          data: {
            bookId: id,
          },
        });
        response.code(201);
        return response;
      }
    }
  } catch (error) {
    const response = h.response({
      status: "error",
      message: "Buku gagal ditambahkan",
    });
    response.code(500);
    return response;
  }
};
const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;
  const mappingBoolean = {
    0: false,
    1: true,
  };
  let filteredBooks = [];

  if (name || reading || finished) {
    console.log(name, reading, finished);
    if (name) {
      filteredBooks = books.filter(
        (book) =>
          book.name
            .toLowerCase()
            .search(new RegExp(name.replace(/"*/g, "").toLowerCase(), "g")) !==
          -1
      );
    }
    if (reading) {
      filteredBooks = name
        ? filteredBooks.filter(
            (book) => book.reading === mappingBoolean[parseInt(reading)]
          )
        : books.filter(
            (book) => book.reading === mappingBoolean[parseInt(reading)]
          );
    }
    if (finished) {
      if (reading || name) {
        filteredBooks = filteredBooks.filter(
          (book) => book.finished === mappingBoolean[parseInt(finished)]
        );
      } else {
        filteredBooks = books.filter(
          (book) => book.finished === mappingBoolean[parseInt(finished)]
        );
      }
    }
  } else {
    filteredBooks = books;
  }
  let privateBooks = [
    ...new Set(
      filteredBooks.map(({ id, name, publisher }) => {
        return {
          id,
          name,
          publisher,
        };
      })
    ),
  ];
  const response = h.response({
    status: "success",
    data: {
      books: privateBooks,
    },
  });
  response.code(200);
  return response;
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const book = books.filter((book) => book.id === bookId)[0];
  if (book) {
    return {
      status: "success",
      data: {
        book,
      },
    };
  }
  const response = h.response({
    status: "fail",
    message: "Buku tidak ditemukan",
  });
  response.code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const indexBook = books.findIndex((book) => book.id === bookId);
  if (!name || readPage > pageCount) {
    let message = "";
    if (!name) {
      message = "Gagal memperbarui buku. Mohon isi nama buku";
    } else if (readPage > pageCount) {
      message =
        "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount";
    }
    const response = h.response({
      status: "fail",
      message: message,
    });
    response.code(400);
    return response;
  } else {
    if (indexBook !== -1) {
      books[indexBook] = {
        ...books[indexBook],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
      };
      const response = h.response({
        status: "success",
        message: "Buku berhasil diperbarui",
      });
      response.code(200);
      return response;
    } else if (indexBook === -1) {
      const response = h.response({
        status: "fail",
        message: "Gagal memperbarui buku. Id tidak ditemukan",
      });
      response.code(404);
      return response;
    }
  }
};
const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const indexBook = books.findIndex((book) => book.id === bookId);
  if (indexBook !== -1) {
    books.splice(indexBook, 1);
    const response = h.response({
      status: "success",
      message: "Buku berhasil dihapus",
    });
    response.code(200);
    return response;
  }
  const response = h.response({
    status: "fail",
    message: "Buku gagal dihapus. Id tidak ditemukan",
  });
  response.code(404);
  return response;
};
module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
