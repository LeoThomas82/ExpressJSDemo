const BookInstance = require("../models/bookinstance");
const Book = require('../models/book');
const asyncHandler = require("express-async-handler");
const {body, validationResult} = require("express-validator");

//Display list of all BookInstances
exports.bookinstance_list = asyncHandler(async(req, res, next)=>{
    const allBookInstances = await BookInstance.find({}).populate("book").exec();

    res.render("bookinstance_list", {
        title:"Book Instance List",
        bookinstance_list:allBookInstances
    });
});

//Display detail page for a specific BookInstance
exports.bookinstance_detail = asyncHandler(async(req, res, next)=>{
    //res.send(`NOT IMPLEMENTED:Bookinstance detail:${req.params.id}`);
    const bookinstance = await BookInstance.findById(req.params.id).populate("book").exec();
    if ( bookinstance === null ) {
        const err = new Error("Book copy does not found");
        err.status = 404;
        return next(err);
    }

    res.render("bookinstance_detail", {
        title:"Book Instance Info: ",
        bookinstance:bookinstance
    });
});

//Display BookInstance create from an GET 
exports.bookinstance_create_get = asyncHandler(async(req, res, next)=>{
    const allBooks = await Book.find({}).sort({title:1}).exec();
    res.render("bookinstance_form", {
        title:'Create BookInstance',
        all_books:allBooks
    });
});

//Handle BookInstance create on POST
exports.bookinstance_create_post = [
    body('book', 'Book must be specified').trim().isLength({min:1}).escape(),
    body('imprint', 'Imprint must be specified').trim().isLength({min:1}).escape(),
    body("status").escape(),
    body("due_back", "Invalid_date").optional({values:"falsy"}).isISO8601().toDate(),

    //Process request after validation and sanitization
    asyncHandler(async(req, res, next)=>{
        //Extract the validation errors from a request
        const errors = validationResult(req);
        //Create a BookInstance object with escaped and trimmed data.
        const bookInstance = new BookInstance({
            book:req.body.book,
            imprint:req.body.imprint,
            status:req.body.status,
            due_back:req.body.due_back
        });

        if (!errors.isEmpty()) {
            //There are errors. Render the form again with sanitized values and error messages.
            const allBooks = await Book.find({}).sort({title:1}).exec();
            res.render('bookinstance_form',{
                title:'Create BookInstance',
                all_books:allBooks,
                selected_book:bookInstance.book._id,
                errors:errors.array(),
                bookinstance:bookInstance
            });
            return;
        } else {
            await bookInstance.save();
            res.redirect(bookInstance.url);
        }
    })
];

//Display BookInstance delte from on GET
exports.bookinstance_delete_get = asyncHandler(async(req, res, next)=>{
    //res.send(`NOT IMPLEMENTED:Bookinstance delete GET`);
    const bookinstance = await BookInstance.findById(req.params.id).populate('book').exec();
    if ( bookinstance === null ) {
        //No results
        const err = new Error("BookInstance not found");
        err.status=404;
        return next(err);
    }
    //Sucess render the form again with sanitized values / err
    res.render("bookinstance_delete", {
        title:'Delete BookInstance',
        bookinstance:bookinstance,
    });
});

//Handle BookInstance delete on POST
exports.bookinstance_delete_post = asyncHandler(async(req, res, next)=>{
    await BookInstance.findByIdAndDelete(req.params.id);
    res.redirect('/catalog/bookinstances');
});

//Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async(req, res, next)=>{
    const [book_instance, allBooks] =  await Promise.all([
        BookInstance.findById(req.params.id).exec(),
        Book.find({}, 'title').sort({title:1}).exec()
    ]);

    if ( book_instance === null ) {
        //No results
        const err = new Error("BookInstance not found");
        err.status = 404;
        return next(err);
    }
    //Sucess render the form again with sanitized values / err
    res.render("bookinstance_form", {
            title:'Update BookInstance',
            bookinstance:book_instance,
            all_books:allBooks,
            selected_book:book_instance.book._id,
    });
})

//Handle bookinstance update on POST
exports.bookinstance_update_post = [
    body('book', 'Book must be specified').trim().isLength({min:1}).escape(),
    body('imprint', 'Imprint must be specified').trim().isLength({min:1}).escape(),
    body("status").escape(),
    body("due_back", "Invalid_date").optional({values:"falsy"}).isISO8601().toDate(),

    //Process request after validation and sanitization
    asyncHandler(async(req, res, next)=>{
        //Extract the validation errors from a request
        const errors = validationResult(req);
        //Create a BookInstance object with escaped and trimmed data.
        const bookInstance = new BookInstance({
            book:req.body.book,
            imprint:req.body.imprint,
            status:req.body.status,
            due_back:req.body.due_back,
            _id:req.params.id //required field
        });

        if (!errors.isEmpty()) {
            //There are errors. Render the form again with sanitized values and error messages.
            const allBooks = await Book.find({}).sort({title:1}).exec();
            res.render('bookinstance_form',{
                title:'Update BookInstance',
                all_books:allBooks,
                selected_book:bookInstance.book._id,
                bookinstance:bookInstance,
                errors:errors.array(),
            });
            return;
        } else {
            const updateBookInstance = await BookInstance.findByIdAndUpdate(req.params.id, bookInstance, {});
            res.redirect(updateBookInstance.url);
        }
    })
];



