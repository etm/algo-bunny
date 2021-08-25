function get_parabel_point(fx,fy,tx,ty,dist_frac) {
  let [cx,cy] = get_parabel_point_c(fx,fy,tx,ty)
  // fy = a * fx * fx + b * fx + c * 1 = fy
  // ty = a * tx * tx + b * tx + c * 1 = ty
  // cy = a * cx * cx + b * cx + c * 1 = ty
  let m = [ [fx*fx,fx,1,fy], [tx*tx,tx,1,ty], [cx*cx,cx,1,cy] ]
  if ( SolveLinEQ( m ) ) {
    let a = m[0][3]
    let b = m[1][3]
    let c = m[2][3]
    console.log(a,b,c)
  } else {
    console.log('no solution')
  }
  // wie die distance dist_frac von fx,fy aus auf der funktion
}

function get_parabel_point_c(fx,fy,tx,ty) {
  mx = (fx+tx)/2;
  my = (fy+ty)/2;

}

function SolveLinEQ( m ) {
  // solves linear equation of rank d with coefficients in m using Gauss Jordan algorithm
  // m: array[d][d+1]
  // returns solution in m[i][d+1]
  // returns false if no solution found
  //
  // usage:
  //
  // EQ 1: a * x + b * y = c
  // EQ 2: e * x + f * y = g
  //
  // var m = [ [ a, b, c ], [ e, f, g ] ];
  // if ( SolveLinEQ( m ) ) {
  //   x = m[0][2];
  //   y = m[1][2];
  // } else {
  //   no solution
  // }

  function findNotZeroRow( r ) {
    for ( var nzr = r + 1; nzr < d; nzr++ ) {
      if ( m[nzr][r] != 0 ) return nzr;
    }
    return -1;
  }

  function swapRows( r1, r2 ) {
    for ( var c = 0; c <= d; c++ ) {
      var tmp = m[r1][c];
      m[r1][c] = m[r2][c];
      m[r2][c] = tmp;
    }
  }

  function normRow( r ) {
    // require m[r][r] != 0
    var a = m[r][r];
    if ( a == 1 ) return;
    m[r][r] = 1;
    for ( var c = r + 1; c <= d; c++ ) {
      m[r][c] /= a;
    }
  }

  function zeroCell( zr, zc ) {
    var a = m[zr][zc];
    if ( a == 0 ) return;
    m[zr][zc] = 0;
    for ( var c = zc + 1; c <= d; c++ ) {
      m[zr][c] -= a * m[zc][c];
    }
  }

  var d = m.length;
  for ( var r = 0; r < d; r++ ) {
    if ( m[r][r] == 0 ) {
      var nzr = findNotZeroRow( r );
      if ( nzr == -1 ) return false;
      swapRows( r, nzr );
    }
    // assert m[r][r] != 0
    normRow( r );
    for ( var zr = 0; zr < d; zr++ ) {
      if ( zr != r ) {
        zeroCell( zr, r );
      }
    }
  }
  return true;
}
