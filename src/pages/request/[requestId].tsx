import { useRouter } from 'next/router'
import type { GetServerSideProps, NextPage } from 'next'
import { loadTranslation } from '../../utils/lingui'

export const getServerSideProps: GetServerSideProps = async ({ params, locale } ) => {
    const requestId = params?.requestId
    const translation = await loadTranslation(
        locale!,
        process.env.NODE_ENV === 'production'
    )
    return {
        props: {
            translation,
            requestId,
        }
    }
}

const RequestPage: NextPage = () => {
    const router = useRouter()

    return (
        <div>
            <h1>Страница запроса {router.query.requestId}</h1>
        </div>
    );
};

export default RequestPage;
