import React, { useState } from 'react';
import { client } from '../utils/fetchClient';
import { Comment } from '../types/Comment';

interface NewCommentFormProps {
  postId: number;
  onAddComment: (comment: Comment) => void;
  onCancel: () => void;
}

interface FormErrors {
  [key: string]: string;
}

export const NewCommentForm: React.FC<NewCommentFormProps> = ({
  postId,
  onAddComment,
  onCancel,
}) => {
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate all form fields and return any errors
  const validateForm = (): FormErrors => {
    const validationErrors: FormErrors = {};

    if (!name.trim()) {
      validationErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      validationErrors.email = 'Email is required';
    }

    if (!body.trim()) {
      validationErrors.body = 'Enter some text';
    }

    return validationErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate form before submission
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);

      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Submit comment to server
      const commentData = { postId, name, email, body };
      const newComment = await client.post<Comment>('/comments', commentData);

      // Update UI and reset form fields
      onAddComment(newComment);
      setBody(''); // Only clear the body, keep author info for potential additional comments
    } catch (err) {
      setErrors({ form: 'Failed to add comment' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear all form fields and errors
  const handleClear = () => {
    setName('');
    setEmail('');
    setBody('');
    setErrors({});
  };

  // Helper function to render field errors
  const renderFieldError = (fieldName: string) =>
    errors[fieldName] ? (
      <p className="help is-danger" data-cy="ErrorMessage">
        {errors[fieldName]}
      </p>
    ) : null;

  // Helper for handling input changes
  const handleInputChange = (
    field: 'name' | 'email' | 'body',
    value: string,
  ) => {
    // Update field value
    if (field === 'name') {
      setName(value);
    }

    if (field === 'email') {
      setEmail(value);
    }

    if (field === 'body') {
      setBody(value);
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };

        delete newErrors[field];

        return newErrors;
      });
    }
  };

  return (
    <form data-cy="NewCommentForm" onSubmit={handleSubmit}>
      {/* Name field */}
      <div className="field" data-cy="NameField">
        <label className="label" htmlFor="comment-author-name">
          Author Name
        </label>
        <div className="control has-icons-left has-icons-right">
          <input
            id="comment-author-name"
            name="name"
            placeholder="Name Surname"
            className={`input ${errors.name ? 'is-danger' : ''}`}
            value={name}
            onChange={e => handleInputChange('name', e.target.value)}
          />
          <span className="icon is-small is-left">
            <i className="fas fa-user" />
          </span>
          {errors.name && (
            <span
              className="icon is-small is-right has-text-danger"
              data-cy="ErrorIcon"
            >
              <i className="fas fa-exclamation-triangle" />
            </span>
          )}
        </div>
        {renderFieldError('name')}
      </div>

      {/* Email field */}
      <div className="field" data-cy="EmailField">
        <label className="label" htmlFor="comment-author-email">
          Author Email
        </label>
        <div className="control has-icons-left has-icons-right">
          <input
            id="comment-author-email"
            name="email"
            placeholder="email@test.com"
            className={`input ${errors.email ? 'is-danger' : ''}`}
            value={email}
            onChange={e => handleInputChange('email', e.target.value)}
          />
          <span className="icon is-small is-left">
            <i className="fas fa-envelope" />
          </span>
          {errors.email && (
            <span
              className="icon is-small is-right has-text-danger"
              data-cy="ErrorIcon"
            >
              <i className="fas fa-exclamation-triangle" />
            </span>
          )}
        </div>
        {renderFieldError('email')}
      </div>

      {/* Comment body field */}
      <div className="field" data-cy="BodyField">
        <label className="label" htmlFor="comment-body">
          Comment Text
        </label>
        <div className="control">
          <textarea
            id="comment-body"
            name="body"
            placeholder="Type comment here"
            className={`textarea ${errors.body ? 'is-danger' : ''}`}
            value={body}
            onChange={e => handleInputChange('body', e.target.value)}
          />
        </div>
        {renderFieldError('body')}
      </div>

      {/* Form buttons */}
      <div className="field is-grouped">
        <div className="control">
          <button
            type="submit"
            className={`button is-link ${isSubmitting ? 'is-loading' : ''}`}
            disabled={isSubmitting}
          >
            Add
          </button>
        </div>
        <div className="control">
          <button
            type="reset"
            className="button is-link is-light"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
        <div className="control">
          <button
            type="button"
            className="button is-link is-light"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Form-level error message */}
      {errors.form && (
        <div className="notification is-danger" data-cy="FormError">
          {errors.form}
        </div>
      )}
    </form>
  );
};
