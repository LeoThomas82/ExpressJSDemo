const Sysuser = require("../models/sysuser");

const asyncHandler = require("express-async-handler");
const {body, validationResult} = require("express-validator");

//Display list of all Authors
exports.sysuser_list = asyncHandler(async(req, res, next)=>{
    const all_sysusers = await Sysuser.find({}).sort({first_name:1}).exec();
    res.render("sysuser_list", {
       title:"System User List",
       sysuser_list:all_sysusers
    });
});

//Display detail page for a specific Sysuser
exports.sysuser_detail = asyncHandler(async(req, res, next) => {
    const sysuser = await Sysuser.findById(req.params.id).exec();
    if ( sysuser === null ) {
        const err = new Error("System User not found");
        err.status = 404;
        return next(err);
    }

    res.render("sysuser_detail", {
        title:"System User Detail",
        sysuser:sysuser,
    });
});

exports.login_get = (req, res, next)=>{
    res.render("sysuser_loginform", {title:"User Login"});
}

exports.login_post = [
    body('username').trim().isLength({min:1}).escape().withMessage("Username must be specified"),
    body('password').trim().isLength({min:1}).escape().withMessage("Password must be specified"),
    asyncHandler(async(req, res, next)=>{
        //Extract the validation errors from a request.
        const errors = validationResult(req);
        //Create a author object with escaped and trimmed data.
        
        if (!errors.isEmpty()){
            //There are errors. Render form again with sanitized values/error messages.
            res.render('sysuser_loginform', {
                title:'User Login',
                username:req.body.username,
                password:req.body.password,
                errors:errors.array(),
            });
            return;
        } else {
            const sysuser = await Sysuser.findOne({username:req.body.username});
            if ( sysuser === null) {
                res.render('sysuser_loginform', {
                    title:'User Login',
                    username:req.body.username,
                    password:req.body.password,
                    errors:[{type:'field', 
                        value:req.body.username,
                        msg:'Unregistered username',
                        'path':'username',
                        location:'body'
                    }]
                });
            } else {
                if ( sysuser.password != req.body.password ) {
                    res.render('sysuser_loginform', {
                        title:'User Login',
                        username:req.body.username,
                        password:req.body.password,
                        errors:[{type:'field', 
                            value:req.body.password,
                            msg:'Incorrect password',
                            'path':'password',
                            location:'body'
                        }]
                    });
                } else {
                    req.session.userinfo.username = req.body.username;
                    res.redirect('/catalog');
                }
            }
        }
})]


//Display Sysuser create form on GET
exports.signup_get = (req, res, next)=>{
    res.render("sysuser_createform", {title:"User Signin"})
}

exports.signup_post = [
    //res.send("NOT IMPLEMENTED: Genre create POST");
    body('first_name').trim().isLength({min:1}).escape().withMessage("First name must be specified")
        .isAlphanumeric().withMessage("First name has non-alphanumeric characters."),
    body('last_name').trim().isLength({min:1}).escape().withMessage("Family name must be specified.")
        .isAlphanumeric().withMessage("Family name has non-alpanumeric characters."),        
    body('date_of_birth', 'Invalid date of birth').isISO8601().toDate(),
    body('username').trim().isLength({min:1}).escape().withMessage("Username must be specified")
        .isAlphanumeric().withMessage("Username has non-alphanumeric characters."),
    body('password').trim().isLength({min:1}).escape().withMessage("Password must be specified"),
    body('passconfirm').trim().isLength({min:1}).escape().withMessage("Password confirmation must be specified"),
    //Process request after validation and sanitization.
    asyncHandler(async(req, res, next)=>{
        //Extract the validation errors from a request.
        const errors = validationResult(req);
        //Create a author object with escaped and trimmed data.
        const sysuser = new Sysuser({
                first_name:req.body.first_name, 
                last_name:req.body.last_name, 
                date_of_birth:req.body.date_of_birth, 
                username:req.body.username,
                password:req.body.password,
            });

        if (!errors.isEmpty()){
            //There are errors. Render form again with sanitized values/error messages.
            res.render('sysuser_createform', {
                title:'Create a new account',
                sysuser:sysuser,
                errors:errors.array(),
            });
            return;
        } else {
            if (req.body.password !== req.body.passconfirm) {
                var errs = errors.array();//.push({type:'field', value:'password', msg:'Password does not match', path:'passconfirm', location:'body'});
                errs.push({type:'field', value:'password', msg:'Password does not match', path:'passconfirm', location:'body'});
                res.render('sysuser_createform',{
                        title:'Create a new account',
                        sysuser:sysuser,
                        errors:errs,
                    });
                return;
            }
            await sysuser.save();
            res.redirect('/login');
        }
    })
];

exports.logout_get = (req, res, next)=>{
    if ( req.session.userinfo.username !=''){
        req.session.userinfo = null;
    }
    res.redirect('/login');
}

//Display Sysuser create form on POST
exports.sysuser_create_post = [
    //res.send("NOT IMPLEMENTED: Genre create POST");
    body('first_name').trim().isLength({min:1}).escape().withMessage("First name must be specified")
        .isAlphanumeric().withMessage("First name has non-alphanumeric characters."),
    body('family_name').trim().isLength({min:1}).escape().withMessage("Family name must be specified.")
        .isAlphanumeric().withMessage("Family name has non-alhpanumeric characters."),        
    body('date_of_birth', 'Invalid date of birth').optional({values:"falsy"}).isISO8601().toDate(),
    body('date_of_death', 'Invalide date of death').optional({values:"falsy"}).isISO8601().toDate(),
    //Process request after validation and sanitization.
    asyncHandler(async(req, res, next)=>{
        //Extract the validation errors from a request.
        const errors = validationResult(req);
        //Create a author object with escaped and trimmed data.
        const author = new Author({
            first_name:req.body.first_name, 
            family_name:req.body.family_name, 
            date_of_birth:req.body.date_of_birth, 
            date_of_death:req.body.date_of_death});

        if (!errors.isEmpty()){
            //There are errors. Render form again with sanitized values/error messages.
            res.render('author_form', {
                title:'Create Author',
                author:author,
                errors:errors.array(),
            });
            return;
        } else {
            //Data from form is valid.
            //Check if Author with same name already exists.
            await author.save();
            res.redirect(author.url);
        }
    })
];

exports.sysuser_delete_get = asyncHandler(async(req, res, next)=>{
    const [author, allBooksByAuthor] = await Promise.all(
        [
            Author.findById(req.params.id).exec(),
            Book.find({author:req.params.id}).exec()
        ]);
    if ( author == null ) {
        //No results
        res.redirect('/catalog/authors');
    }

    res.render('author_delete', {
        title:'Delete Author',
        author:author,
        author_books:allBooksByAuthor
    });
})

//Handle Sysuser delete on POST
exports.sysuser_delete_post = asyncHandler(async(req, res, next)=>{
    const [author, allBooksByAuthor] = await Promise.all([
        Author.findById(req.params.id).exec(),
        Book.find({author:req.params.id}, 'title summary').exec()
    ]);

    if (allBooksByAuthor.length > 0 ) {
        //Author has books. Render in same way as for GET route.
        res.render('author_delete', {
            title:'Delete Author',
            author:author,
            author_books:allBooksByAuthor
        });
        return;
    } else {
        await Author.findByIdAndDelete(req.body.authorid);
        res.redirect('/catalog/authors');
    }
});

//Display Author update form on GET
exports.sysuser_update_get = asyncHandler(async(req, res, next)=>{
    //res.send(`NOT IMPLEMENTED:Author update GET`);
    const sysuser = await Sysuser.findById(req.params.id).exec();
    if ( sysuser === null ) {
        //No results
        const err = new Error("Author not found");
        err.status = 404;
        return next(err);
    }

    //Sucess render the form again with sanitized values / err
    res.render("sysuser_form", {
            title:'Update Sysuser',
            author:author,
        }
    );
});

exports.sysuser_update_post = [
    //Validate and sanitize fields
    body('first_name').trim().isLength({min:1}).escape().withMessage("First name must be specified")
        .isAlphanumeric().withMessage("First name has non-alphanumeric characters."),
    body('family_name').trim().isLength({min:1}).escape().withMessage("Family name must be specified.")
        .isAlphanumeric().withMessage("Family name has non-alhpanumeric characters."),        
    body('date_of_birth', 'Invalid date of birth').optional({values:"falsy"}).isISO8601().toDate(),
    body('date_of_death', 'Invalide date of death').optional({values:"falsy"}).isISO8601().toDate(),

    //Process request after validation and sanitization
    asyncHandler(async(req, res, next)=>{
        //Extract the validation errors from a request
        const errors = validationResult(req);
        //Create a Author object with escapted/timmed data and old id
        const author = new Author({
            first_name:req.body.first_name,
            family_name:req.body.family_name,
            date_of_birth:req.body.date_of_birth,
            date_of_death:req.body.date_of_death,
            _id:req.params.id, //This is required, or a new ID will be assigned!
        });

        if ( !errors.isEmpty()) {
            //There are errors. Render form again with sanitized values / error messages
            res.render("author_form", {
                title:"Update Author",
                author:author,
                errors:errors.array(),
            });
            return;
        } else {
            //Data from form is valid
            const updateAuthor = await Author.findByIdAndUpdate(req.params.id, author, {});
            //Redirect to author detail page
            res.redirect(updateAuthor.url);
        }
    })
];




