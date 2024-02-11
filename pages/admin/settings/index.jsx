/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import useCurrentUser from '@/hooks/useCurrentUser';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as Dialog from '@radix-ui/react-dialog';
import UploadModal from '@/components/shared/modals/upload-modal';
import { TinyLoader } from '@/components/utils/tiny-loader';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Balancer } from 'react-wrap-balancer';
import useUser from '@/hooks/useUser';
import { UserAvatarSetting } from '@/components/utils/avatar';
import { signalIframe } from '@/utils/helpers';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import CustomAlert from '@/components/shared/alerts/custom-alert';
import useMediaQuery from '@/hooks/use-media-query';
import { signOut } from 'next-auth/react';
import Head from 'next/head';

const Settings = () => {
  const { data: currentUser } = useCurrentUser();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [image, setImage] = useState('');
  const [handle, setHandle] = useState('');

  const { isMobile } = useMediaQuery();

  const queryClient = useQueryClient();
  const { data: fetchedUser } = useUser(currentUser?.handle);

  useEffect(() => {
    setUsername(fetchedUser?.name);
    setBio(fetchedUser?.bio);
    setImage(fetchedUser?.image);
    setHandle(fetchedUser?.handle);
  }, [
    fetchedUser?.name,
    fetchedUser?.bio,
    fetchedUser?.image,
    fetchedUser?.handle,
  ]);

  // edit profile details
  const editMutation = useMutation(
    async ({ bio, username, image, handle }) => {
      await axios.patch('/api/edit', {
        bio,
        username,
        image,
        handle,
      });
    },
    {
      onError: () => {
        toast.error('Um erro ocorreu');
      },
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('Alterações aplicadas');
        signalIframe();
      },
    }
  );

  const handleSubmit = async () => {
    toast.loading('Aplicando alterações');
    await editMutation.mutateAsync({ bio, username, image, handle });
  };

  // delete profile picture
  const handleDeletePfp = async () => {
    if (image === '') {
      toast.error('Não há nada para excluir');
      return;
    } else {
      toast.loading('Aplicando alterações');
      await editMutation.mutateAsync({ bio, username, image: '', handle });
    }
  };

  // delete user's account
  const deleteMutation = useMutation(
    async () => {
      await axios.delete('/api/edit');
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        router.push('/register');
      },
    }
  );

  const handleDeleteUser = async () => {
    await toast.promise(deleteMutation.mutateAsync(), {
      loading: 'Excluindo sua conta',
      success: 'Até logo parceiro 🫡',
      error: 'Um erro ocorreu',
    });
    await signOut();
  };

  const deleteAlertProps = {
    action: handleDeleteUser,
    title: 'Você tem certeza absoluta?',
    desc: 'Essa ação não pode ser desfeita. Isso excluirá permanentemente sua conta e removerá seus dados de nossos servidores.',
    confirmMsg: 'Sim, excluir conta',
  };

  return (
    <>
      <Head>
        <title>Paratodos.link | Configurações</title>
      </Head>
      <Layout>
        <div className="w-full lg:basis-3/5 pl-4 pr-4 border-r overflow-scroll">
          <div className="max-w-[690px] mx-auto my-10">
            <h3 className="text-xl font-semibold">Profile</h3>
            <div className="mt-4 rounded-2xl border bg-white p-lg w-full h-auto pb-10">
              <div className="flex flex-col lg:flex-row gap-x-6 p-10">
                <div className="w-[100px] h-[100px] pb-6 rounded-full flex items-center mx-auto">
                  {fetchedUser ? (
                    <UserAvatarSetting />
                  ) : (
                    <TinyLoader color="black" stroke={1} size={100} />
                  )}
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <div className="relative overflow-hidden">
                    <Dialog.Root>
                      <Dialog.Trigger asChild>
                        <button className="relative w-full lg:w-[490px] h-[45px] border rounded-3xl border-[#000] outline-none text-white bg-slate-900 p-2 hover:bg-slate-700">
                          Escolha uma imagem
                        </button>
                      </Dialog.Trigger>
                      <UploadModal
                        value={image}
                        onChange={(image) => setImage(image)}
                        submit={handleSubmit}
                      />
                    </Dialog.Root>
                  </div>
                  <button
                    onClick={handleDeletePfp}
                    className="w-full lg:w-[490px] h-[45px] border border-[#aaa] 
                    outline-none font-semibold text-slate-900 bg-white p-2 rounded-3xl hover:bg-gray-100"
                  >
                    Remover
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-4 max-w-[640px] mx-auto px-4">
                <input
                  value={username ?? ''}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={handleSubmit}
                  placeholder="@Username"
                  className="outline-none w-full p-4 h-[50px] rounded-lg border-2 bg-gray-100 text-black focus:border-slate-900"
                />

                <textarea
                  value={bio ?? ''}
                  onChange={(e) => setBio(e.target.value)}
                  onBlur={handleSubmit}
                  placeholder="@Bio"
                  className="outline-none w-full p-4 h-[120px] rounded-lg border-2
                bg-gray-100 text-black focus:border-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="max-w-[690px] mx-auto my-10">
            <h3 className="text-xl font-semibold mb-1">Danger Zone</h3>
            <h3 className="mb-4 text-gray-600 text-sm">
              <Balancer>
                Excluir sua conta exclui permanentemente sua página e todos os seus
                dados.
              </Balancer>
            </h3>
            <div className="w-full h-auto border bg-white rounded-lg p-6 ">
              <AlertDialog.Root>
                <AlertDialog.Trigger asChild>
                  <button
                    className="border-none w-full lg:w-[200px] rounded-lg h-auto p-3
									  text-white bg-red-600 hover:bg-red-500"
                  >
                    Deletar conta
                  </button>
                </AlertDialog.Trigger>
                <CustomAlert {...deleteAlertProps} />
              </AlertDialog.Root>
            </div>
          </div>
          {isMobile ? (
            <div className="h-[100px] mb-24" />
          ) : (
            <div className="h-[40px] mb-12" />
          )}
        </div>
      </Layout>
    </>
  );
};

export default Settings;
