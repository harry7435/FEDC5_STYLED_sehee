import { useTheme } from 'styled-components';
import { useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from '@/Hooks';

import SignUpButton from '@/Components/Base/Button';
import Input from '@/Components/Base/Input';
import Spinner from '@/Components/Base/Spinner';

import ERROR_MESSAGES from '@/Constants/Message';
import { signUp, login } from '@/Services/Auth';
import { PostSignUpRequestType } from '@/Types/Request';
import validateSignUp from './validateSignUp';
import StyledForm from './style';
import { Props } from './type';

const SignUpForm = ({ onSuccessCallback, onErrorCallback }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { colors, size } = useTheme();

  const { mutate, status } = useMutation({
    mutationFn: (signUpFormData: PostSignUpRequestType) =>
      signUp(signUpFormData),
    onSuccess: async (response) => {
      if (response) {
        const loginResponse = await login({
          email: values.email,
          password: values.password,
        });
        if (loginResponse) {
          onSuccessCallback(loginResponse);
        } else {
          onErrorCallback(ERROR_MESSAGES.LOGIN);
        }
      }
    },
    onError: () => onErrorCallback(ERROR_MESSAGES.SIGN_UP),
  });

  const { values, errors, isLoading, handleOnChange, handleOnSubmit } =
    useForm<PostSignUpRequestType>({
      initialState: { email: '', fullName: '', password: '' },
      callback: (): void => mutate({ ...values }),
      validate: (formValues) => validateSignUp(formValues),
    });

  const inputStyle = {
    padding: size.large,
    fontSize: size.medium,
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <>
      {isLoading && <Spinner />}
      <StyledForm onSubmit={handleOnSubmit}>
        <Input
          ref={inputRef}
          type="fullName"
          name="fullName"
          label="이름"
          placeholder="이름"
          required
          errorMessage={errors.fullName}
          onChange={handleOnChange}
          style={inputStyle}
        />
        <Input
          type="email"
          name="email"
          label="이메일"
          placeholder="이메일"
          required
          errorMessage={errors.email}
          onChange={handleOnChange}
          style={inputStyle}
        />
        <Input
          type="password"
          name="password"
          label="비밀번호"
          placeholder="비밀번호"
          required
          errorMessage={errors.password}
          onChange={handleOnChange}
          style={inputStyle}
        />
        <SignUpButton
          width={size.full}
          textSize={size.large}
          textColor={colors.buttonText}
          backgroundColor={colors.buttonBackground}
          borderRadius={size.small}
          disabled={status === 'pending'}
          style={{
            padding: size.doubleLarge,
            marginTop: size.large,
            border: `0.1rem solid ${colors.text}`,
          }}
        >
          회원가입
        </SignUpButton>
      </StyledForm>
    </>
  );
};

export default SignUpForm;
