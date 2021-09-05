// Информация о загруженной странице, сформированная сервером
export interface Pagination {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
}

// Класс, обеспечивающий добавление к объекту, полученному от сервера,
// данных о текущей загруженной страницы
export class PaginatedResult<T> {
    data: T;
    pagination: Pagination;

    constructor(data: T, pagination: Pagination) {
        this.data = data;
        this.pagination = pagination;
    }
}

// Параметры страницы, передаваемые от клиента в API
export class PagingParams {
    pageNumber;
    pageSize;

    constructor(pageNumber = 1, pageSize = 20) {
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
    }
}
