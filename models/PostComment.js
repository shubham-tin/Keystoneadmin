var keystone = require('keystone');
var Types = keystone.Field.Types;
//requiring keystone field types
/**
	Posts
	=====
 */

var PostComment = new keystone.List('PostComment', {
	label: 'Comments',
});
//post comment contains ----
//author name ( referenced to usermodel )
//post (referenced to post schema or model)
//published-on ---- date / noedit:true


PostComment.add({
	author: { type: Types.Relationship, initial: true, ref: 'Usermodel', index: true },
	post: { type: Types.Relationship, initial: true, ref: 'Post', index: true },//multiple options
	commentState: { type: Types.Select, options: ['published', 'draft', 'archived'], default: 'published', index: true },
	publishedOn: { type: Types.Date, default: Date.now, noedit: true, index: true },
});


//content type
//wysiwyg - well this is an editor in the system in which the content can be edited in a form closely 
//resembling to the one that is finally displayed or produced 

PostComment.add('Content', {
	content: { type: Types.Html, wysiwyg: true, height: 300 },//aliasing this as Content
});

//pre is a mongoose method 
PostComment.schema.pre('save', function (next) {
	this.wasNew = this.isNew;
	if (!this.isModified('publishedOn') && this.isModified('commentState') && this.commentState === 'published') {
		this.publishedOn = new Date();
	}
	next();
});

PostComment.schema.post('save', function () {
	if (!this.wasNew) return;
	if (this.author) {//populate the comment section
		keystone.list('Usermodel').model.findById(this.author).exec(function (err, user) {
			if (user) {
				user.wasActive().save();
			}
		});
	}
});

PostComment.track = true;
PostComment.defaultColumns = 'author, post, publishedOn, commentState';
PostComment.register();