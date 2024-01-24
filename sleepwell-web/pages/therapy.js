import RegisterForm from "../components/RegisterForm";
import "../components/Firebase";
import { useRouter } from "next/router";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import Layout from "../components/layout";

export default function Results() {
  return (
    <Layout>
      <div class="flex h-screen flex-col">
        <h1 class="basis-1/5 bg-red-900 pt-5 text-center text-4xl font-semibold ">
          Sleep Therapy
        </h1>
        <div class="basis-1/5 bg-blue-300"></div>
        <div class="basis-1/5 bg-blue-300"></div>
        <div class="basis-1/5 bg-red-300"></div>
        <div class="flex basis-1/5 bg-blue-300">
          <div class="mx-auto flex w-1/3 flex-col  rounded-sm py-6">
            <div class="flex basis-1/2 bg-slate-400 ">
              Your sleep prescription for week 2
            </div>
            <div class="flex basis-1/2 flex-row bg-red-400">
              <div class="p-auto w-1/2 basis-1/2 items-center">
                <p class="just items-center bg-red-900">Rise Time: 7:00 am</p>
              </div>
              <div class="w-1/2 basis-1/2">Bed Time: 11:00 am </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
