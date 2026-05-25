import React, { useMemo, useState } from "react";
import { Pagination } from "react-bootstrap";

const PaginatedList = ({
  data = [],
  rowsPerPage = 10,
  renderItem,
}) => {

  const [currentPage, setCurrentPage] =
    useState(1);

  const totalPages = Math.ceil(
    data.length / rowsPerPage
  );

  const paginatedData = useMemo(() => {

    const start =
      (currentPage - 1) * rowsPerPage;

    return data.slice(
      start,
      start + rowsPerPage
    );

  }, [data, currentPage, rowsPerPage]);

  return (
    <>
      {paginatedData.map(renderItem)}

      {totalPages > 1 && (
        <Pagination className="mt-3 justify-content-center">

          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage((prev) => prev - 1)
            }
          />

          {[...Array(totalPages)].map(
            (_, index) => (
              <Pagination.Item
                key={index + 1}
                active={
                  currentPage === index + 1
                }
                onClick={() =>
                  setCurrentPage(index + 1)
                }
              >
                {index + 1}
              </Pagination.Item>
            )
          )}

          <Pagination.Next
            disabled={
              currentPage === totalPages
            }
            onClick={() =>
              setCurrentPage((prev) => prev + 1)
            }
          />

        </Pagination>
      )}
    </>
  );
};

export default PaginatedList;