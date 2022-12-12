import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { AxiosPromise } from 'axios'
import { useMutation } from 'react-query'
import { Progress } from '../../components/progress'
import { FormLabel, FormErrorMessage } from '../atoms'
import { Confirm } from '../template'
import { TextFieldType } from '../../data'
import {
  ChangePasswordRequest,
  BaseResponse,
  AuthRepository,
} from '../../repository/auth-repository'

const captains = console

type FormValues = {
  password: string
  confirmPassword: string
}

const schema = z
  .object({
    password: z
      .string()
      .min(1, { message: '入力してください' })
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
        'アルファベット（大文字小文字混在）と数字と特殊記号を組み合わせて8文字以上で入力してください'
      ),
    confirmPassword: z
      .string()
      .min(1, { message: '入力してください' })
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
        'アルファベット（大文字小文字混在）と数字と特殊記号を組み合わせて8文字以上で入力してください'
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '確認用パスワードが一致していません',
    path: ['confirmPassword'],
  })

export const PasswordDialog = ({
  onSubmit,
  onClose,
  onCancel,
}: {
  onSubmit: () => void
  onClose: (event: any) => void
  onCancel: (event: any) => void
}): JSX.Element => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: 'Password1?',
      confirmPassword: 'Password1?',
    },
  })
  const mutation = useMutation(
    (req: ChangePasswordRequest): AxiosPromise<BaseResponse> =>
      AuthRepository.changePassword(req)
  )

  const doSubmit = (data: FormValues): void => {
    captains.log(data)
    const request: ChangePasswordRequest = {
      password: data.password,
    }
    mutation.mutate(request, {
      onSuccess: () => {
        onClose(null)
        onSubmit()
      },
    })
  }

  return (
    <>
      <Progress processing={mutation.isLoading} />
      <Confirm
        title={'パスワード変更'}
        onSubmit={handleSubmit(doSubmit)}
        onClose={onClose}
        onCancel={onCancel}
        processing={mutation.isLoading}
      >
        <form className="px-6 mt-4 mb-4 w-full">
          <label className="block">
            <FormLabel>新しいパスワード</FormLabel>
            <input
              id="password"
              type={TextFieldType.Password}
              className={`mt-1 w-full border-gray-300 block rounded-md focus:border-indigo-600 ${
                errors.password ? 'border-red-400' : ''
              }`}
              {...register('password')}
            />
            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
          </label>

          <label className="block mt-5">
            <FormLabel>新しいパスワード(確認用)</FormLabel>
            <input
              id="confirmPassword"
              type={TextFieldType.Password}
              className={`mt-1 w-full border-gray-300 block rounded-md focus:border-indigo-600 ${
                errors.confirmPassword ? 'border-red-400' : ''
              }`}
              {...register('confirmPassword')}
            />
            <FormErrorMessage>
              {errors.confirmPassword?.message}
            </FormErrorMessage>
          </label>
        </form>
      </Confirm>
    </>
  )
}

export default PasswordDialog
